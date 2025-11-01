"""상록구청 게시판에서 기관 정보를 수집해 JSON으로 저장하는 스크립트."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://www.ansan.go.kr/sangnokgu/common/bbs/selectPageListBbs.do"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
}


@dataclass(frozen=True)
class BoardConfig:
    name: str
    params: Dict[str, str]
    pages: Iterable[int]
    fields: Sequence[str]
    output_path: Path
    type_key: Optional[str] = None
    type_constant: Optional[str] = None
    allowed_types: Optional[Sequence[str]] = None


BOARD_CONFIGS: Dict[str, BoardConfig] = {
    "medical_facilities": BoardConfig(
        name="medical_facilities",
        params={
            "key": "1539",
            "bbs_code": "B0170",
            "bbs_seq": "",
            "sch_type": "sj",
            "sch_text": "",
        },
        pages=range(1, 4),
        fields=("기관명", "기관종명", "주소", "전화번호"),
        output_path=Path(__file__).with_name("medical_facilities.json"),
        type_key="기관종명",
        allowed_types=("병원", "종합병원"),
    ),
    "pharmacies": BoardConfig(
        name="pharmacies",
        params={
            "key": "1540",
            "bbs_code": "B0171",
            "bbs_seq": "",
            "sch_type": "sj",
            "sch_text": "",
        },
        pages=range(1, 13),
        fields=("기관명", "전화번호", "관리기관", "주소"),
        output_path=Path(__file__).with_name("pharmacies.json"),
        type_constant="일반약국",
        allowed_types=None,
    ),
    "clinics": BoardConfig(
        name="clinics",
        params={
            "key": "1541",
            "bbs_code": "B0172",
            "bbs_seq": "",
            "sch_type": "sj",
            "sch_text": "",
        },
        pages=range(1, 29),
        fields=("기관명", "전화번호", "종별", "주소"),
        output_path=Path(__file__).with_name("clinics.json"),
        type_key="종별",
        allowed_types=(
            "보건지소",
            "여성의원",
            "보건소",
            "소아과 의원",
            "산부인과 의원",
        ),
    ),
}


def fetch_page(page: int, params: Dict[str, str]) -> str:
    query = {**params, "currentPage": str(page)}
    response = requests.get(BASE_URL, params=query, headers=HEADERS, timeout=20)
    response.raise_for_status()
    return response.text


def normalize_type(value: str) -> str:
    return "".join(value.split())


def type_matches(value: str, allowed: Optional[Sequence[str]]) -> bool:
    if allowed is None:
        return True

    normalized_value = normalize_type(value)
    for candidate in allowed:
        normalized_candidate = normalize_type(candidate)
        if normalized_candidate and normalized_candidate == normalized_value:
            return True
    return False


def parse_facilities(
    html: str, config: BoardConfig
) -> tuple[List[Dict[str, str]], bool]:
    soup = BeautifulSoup(html, "html.parser")
    facilities: List[Dict[str, str]] = []
    has_rows = False

    for row in soup.select("table.p-table.simple tbody tr"):
        cells = [cell.get_text(strip=True) for cell in row.find_all("td")]
        if len(cells) < len(config.fields) + 1:
            continue

        has_rows = True

        data = {field: cells[index + 1] for index, field in enumerate(config.fields)}

        type_value: Optional[str] = None
        if config.type_key and config.type_key in data:
            type_value = data[config.type_key]
        if type_value is None and config.type_constant is not None:
            type_value = config.type_constant

        if config.allowed_types is not None:
            if not type_value:
                continue
            if not type_matches(type_value, config.allowed_types):
                continue

        if type_value:
            data["종별"] = type_value
        facilities.append(data)

    return facilities, has_rows


def crawl(config: BoardConfig) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []
    for page in config.pages:
        html = fetch_page(page, config.params)
        page_facilities, has_rows = parse_facilities(html, config)
        if not page_facilities:
            if has_rows:
                print(
                    f"경고: {page}페이지에서 조건에 맞는 데이터가 없습니다.",
                    file=sys.stderr,
                )
            else:
                print(
                    f"경고: {page}페이지에서 수집된 데이터가 없습니다.",
                    file=sys.stderr,
                )
        else:
            results.extend(page_facilities)
    return results


def save_to_json(data: List[Dict[str, str]], destination: Path) -> None:
    destination.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    all_records: List[Dict[str, str]] = []
    for config in BOARD_CONFIGS.values():
        records = crawl(config)
        save_to_json(records, config.output_path)
        print(
            f"[{config.name}] 총 {len(records)}건을 '{config.output_path}'에 저장했습니다."
        )
        all_records.extend(records)

    combined_path = Path(__file__).with_name("facilities.json")
    save_to_json(all_records, combined_path)
    print(f"[combined] 총 {len(all_records)}건을 '{combined_path}'에 저장했습니다.")


if __name__ == "__main__":
    main()

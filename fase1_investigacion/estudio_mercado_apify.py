#!/usr/bin/env python3
"""
BIOMEDIC — Fase 1: Inteligencia de Mercado con Apify
Ubicación objetivo: Cuenca, Ecuador
Líneas analizadas:
  1. Centros Médicos Integrales (Medicina General, Odontología, Psicología)
  2. Laboratorios Clínicos en Cuenca
  3. Registros Sanitarios / Licencias ARCSA y Análisis de Productos en Ecuador
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path


def load_env(env_path: Path) -> dict:
    env_vars = {}
    if not env_path.exists():
        return env_vars
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars


def apify_request(url: str, token: str, payload: dict = None, timeout: int = 180):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    root_dir = Path(__file__).resolve().parent.parent
    env_vars = load_env(root_dir / ".env")
    token = env_vars.get("APIFY_API_TOKEN") or os.environ.get("APIFY_API_TOKEN")

    if not token:
        print("ERROR: No se encontró APIFY_API_TOKEN en .env")
        sys.exit(1)

    print("1. Verificando conexión con Apify API...")
    user_info = apify_request("https://api.apify.com/v2/users/me", token, timeout=30)
    username = user_info.get("data", {}).get("username", "Usuario")
    plan = user_info.get("data", {}).get("plan", {}).get("id", "Free")
    print(f"   ✓ Conectado exitosamente a Apify (Cuenta: {username} | Plan: {plan})")

    print("\n2. Ejecutando Actor de Apify (apify/google-search-scraper) para investigar el mercado en Cuenca, Ecuador...")
    queries = [
        "centro medico integral laboratorio clinico odontologia psicologia Cuenca Ecuador",
        "laboratorio clinico examenes a domicilio precios Cuenca Ecuador opiniones",
        "registro sanitario ARCSA asesoria licencia productos laboratorio analisis Cuenca Ecuador",
    ]

    actor_url = (
        "https://api.apify.com/v2/acts/apify~google-search-scraper/"
        "run-sync-get-dataset-items?timeout=120"
    )
    payload = {
        "queries": "\n".join(queries),
        "countryCode": "ec",
        "languageCode": "es",
        "maxPagesPerQuery": 1,
        "resultsPerPage": 10,
        "mobileResults": False,
    }

    results = apify_request(actor_url, token, payload=payload, timeout=150)

    output_dir = Path(__file__).resolve().parent
    raw_output_path = output_dir / "apify_mercado_cuenca.json"

    extracted_summary = []
    for page in results:
        search_query = page.get("searchQuery", {}).get("term", "")
        organic = page.get("organicResults", [])
        places = page.get("places", []) or page.get("localResults", [])
        people_also_ask = page.get("peopleAlsoAsk", [])

        extracted_summary.append({
            "query": search_query,
            "total_organic": len(organic),
            "organic_top": [
                {
                    "title": item.get("title"),
                    "url": item.get("url"),
                    "description": item.get("description"),
                }
                for item in organic[:8]
            ],
            "local_places": places[:6] if isinstance(places, list) else [],
            "people_also_ask": people_also_ask[:6] if isinstance(people_also_ask, list) else [],
        })

    raw_output_path.write_text(
        json.dumps(extracted_summary, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"   ✓ Extracción completada. Datos guardados en: {raw_output_path}")
    for group in extracted_summary:
        print(f"\n--- Búsqueda: {group['query']} ---")
        for idx, item in enumerate(group["organic_top"][:5], 1):
            print(f"  {idx}. {item['title']} -> {item['url']}")
            if item.get("description"):
                print(f"     {item['description'][:140]}...")


if __name__ == "__main__":
    main()

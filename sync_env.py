#!/usr/bin/env python3
"""
Sincroniza las variables públicas de Supabase desde .env hacia env-config.js
para que la aplicación web funcione en local y en Vercel.
"""

from pathlib import Path


def sync():
    root = Path(__file__).resolve().parent
    env_path = root / ".env"
    env_vars = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

    supabase_url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL", "")
    supabase_key = env_vars.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    calendly_url = env_vars.get("NEXT_PUBLIC_CALENDLY_URL", "")

    js_content = (
        "// Archivo generado automáticamente desde .env por sync_env.py\n"
        "window.BIOMEDIC_CONFIG = {\n"
        f'  SUPABASE_URL: "{supabase_url}",\n'
        f'  SUPABASE_ANON_KEY: "{supabase_key}",\n'
        f'  CALENDLY_URL: "{calendly_url}"\n'
        "};\n"
    )
    (root / "env-config.js").write_text(js_content, encoding="utf-8")
    print("✓ env-config.js actualizado desde .env")


if __name__ == "__main__":
    sync()

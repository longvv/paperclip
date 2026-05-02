#!/usr/bin/env python3
import csv
import os
import requests
import re
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path("/Users/rian.vu/Documents/paperclip")
BMAD_DIR = PROJECT_ROOT / "_bmad"
CATALOG_PATH = BMAD_DIR / "_config" / "bmad-help.csv"
MEMORY_PATH = BMAD_DIR / "memory" / "bmad-help" / "MEMORY.md"

def distill_csv(path):
    distillate = ["## Catalog Distillate\n"]
    with open(path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['skill'] == '_meta':
                continue
            
            # Compress the info
            line = f"- **[{row['menu-code']}] {row['display-name']}** (`{row['skill']}`): {row['description']}"
            if row['phase']:
                line += f" | Phase: {row['phase']}"
            if row['after']:
                line += f" | After: {row['after']}"
            if row['required'] == 'true':
                line += " | **REQUIRED**"
            
            distillate.append(line)
    return "\n".join(distillate)

def fetch_and_distill_docs(catalog_path):
    docs_distillate = ["\n## Module Documentation Distillate\n"]
    urls = []
    
    with open(catalog_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['skill'] == '_meta' and row['output-location'].startswith('http'):
                urls.append((row['module'], row['output-location']))
    
    for module, url in urls:
        print(f"Fetching docs for {module} from {url}...")
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                content = response.text
                # Distill: remove long prose, keep headings and key bullets
                distilled_content = []
                for line in content.split('\n'):
                    line = line.strip()
                    if line.startswith('#'):
                        distilled_content.append(line)
                    elif line.startswith('-') or line.startswith('*'):
                        # Keep short bullets
                        if len(line) < 200:
                            distilled_content.append(line)
                
                docs_distillate.append(f"### {module} Documentation")
                docs_distillate.append(f"Source: {url}")
                docs_distillate.extend(distilled_content[:50]) # Cap per module for token efficiency
                docs_distillate.append("")
        except Exception as e:
            docs_distillate.append(f"### {module} Documentation (Fetch Failed)")
            docs_distillate.append(f"Error: {str(e)}")
            
    return "\n".join(docs_distillate)

def main():
    print("Refreshing BMad Help Memory...")
    
    catalog_dist = distill_csv(CATALOG_PATH)
    docs_dist = fetch_and_distill_docs(CATALOG_PATH)
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    memory_content = f"""# Memory

_Curated long-term knowledge. Last updated: {now}_

{catalog_dist}

{docs_dist}

## Project State
_Scan artifact folders to determine completion._
"""
    
    MEMORY_PATH.write_text(memory_content)
    print(f"Memory updated at {MEMORY_PATH}")

if __name__ == "__main__":
    main()

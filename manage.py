"""Portable project commands. Python standard library only."""
from pathlib import Path
import argparse
import functools
import hashlib
import http.server
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent

def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)

def build():
    run(sys.executable, str(ROOT / "scripts/content.py"))

def check():
    run(sys.executable, str(ROOT / "scripts/check-site.py"))
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required for JavaScript syntax checks; install Node.js 22+ and retry.")
    for path in sorted((ROOT / "dist").glob("*.js")):
        run(node, "--check", str(path))
    print("PASS: all application JavaScript syntax checks")

def package():
    build()
    check()
    output = ROOT / "releases"
    output.mkdir(exist_ok=True)
    archive = output / "ITCraft-GitHub-Source.zip"
    files = []
    for path in sorted(ROOT.rglob("*")):
        relative = path.relative_to(ROOT)
        if not path.is_file() or any(p in {".git", ".openai", "__pycache__", "releases", "node_modules"} for p in relative.parts):
            continue
        if path.name == "SHA256SUMS.txt" or path.name.startswith(".env") or path.suffix in {".pyc", ".zip"}:
            continue
        files.append(path)
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
        for path in files:
            bundle.write(path, "ITCraft-Website/" + path.relative_to(ROOT).as_posix())
        manifest = "\n".join(hashlib.sha256(p.read_bytes()).hexdigest()+"  "+p.relative_to(ROOT).as_posix() for p in files)+"\n"
        bundle.writestr("ITCraft-Website/SHA256SUMS.txt", manifest)
    print(archive)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["dev", "build", "check", "package"])
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if args.command == "dev":
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / "dist"))
        with http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
            print(f"ITCraft: http://127.0.0.1:{args.port} (Ctrl+C to stop)", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
    elif args.command == "build":
        build()
    elif args.command == "check":
        check()
    else:
        package()

if __name__ == "__main__":
    main()

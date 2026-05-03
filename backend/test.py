import os

def collect_python_files(root_folder, output_file):
    with open(output_file, "w", encoding="utf-8") as out:
        for dirpath, dirnames, filenames in os.walk(root_folder):
            # Exclude 'venv' directories
            dirnames[:] = [d for d in dirnames if d != "venv"]

            for filename in filenames:
                if filename.endswith(".py"):
                    full_path = os.path.join(dirpath, filename)
                    relative_path = os.path.relpath(full_path, root_folder)

                    out.write("\n" + "=" * 80 + "\n")
                    out.write(f"FILE: {relative_path}\n")
                    out.write("=" * 80 + "\n\n")

                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            out.write(f.read())
                            out.write("\n\n")
                    except Exception as e:
                        out.write(f"[Error reading file: {e}]\n\n")

if __name__ == "__main__":
    root_folder = "./"   # change this
    output_file = "python_files_dump.txt"

    collect_python_files(root_folder, output_file)
    print(f"All Python files saved to {output_file}")
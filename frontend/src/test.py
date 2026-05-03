import os

def extract_contents(root_folder, output_file="combined_output.txt"):
    with open(output_file, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk(root_folder):
            for file in files:
                file_path = os.path.join(root, file)

                # Get relative path
                relative_path = os.path.relpath(file_path, root_folder)

                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        content = infile.read()

                    outfile.write(f"\n{'='*80}\n")
                    outfile.write(f"FILE: {relative_path}\n")
                    outfile.write(f"{'='*80}\n\n")
                    outfile.write(content)
                    outfile.write("\n\n")

                except Exception as e:
                    outfile.write(f"\n[Skipped file: {relative_path} | Reason: {e}]\n")

    print(f"Extraction complete. Output saved to: {output_file}")


if __name__ == "__main__":
    folder_path = input("Enter folder path: ").strip()
    extract_contents(folder_path)
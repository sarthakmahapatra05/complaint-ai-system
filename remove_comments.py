import os
import re

def remove_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    new_lines = []
    
    if file_path.endswith('.py'):
        # Matches lines that are entirely a comment or empty spaces then comment
        pattern = re.compile(r'^\s*#.*$')
    elif file_path.endswith(('.js', '.jsx', '.ts', '.tsx', '.css')):
        pattern = re.compile(r'^\s*//.*$')
    else:
        return

    changed = False
    for line in lines:
        if pattern.match(line):
            changed = True
            continue
        new_lines.append(line)
        
    if changed:
        print(f"Removed comments from {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

def main():
    root_dirs = ['backend', 'frontend']
    for root_dir in root_dirs:
        for root, _, files in os.walk(root_dir):
            # skip virtual envs and node_modules
            if '.venv' in root or 'node_modules' in root or '.git' in root:
                continue
            for file in files:
                if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.css')):
                    file_path = os.path.join(root, file)
                    try:
                        remove_comments(file_path)
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    main()

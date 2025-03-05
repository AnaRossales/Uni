import os

folder_path = 'C:\\Users\\Ana\\Documents\\Uni_code\\Sem3\\ejemplo'

for filename in os.listdir(folder_path):
    if filename.endswith('.txt'):
        old_file = os.path.join(folder_path, filename)
        new_file = os.path.join(folder_path, 'backup_' + filename)  

        os.rename(old_file, new_file)
        print(f'Renombrado: {filename} -> {new_file}')




import sqlite3



conn = sqlite3.connect('instance/salon.db')

cursor = conn.cursor()



# Get the list of tables

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")

tables = cursor.fetchall()



# For each table, get the schema

for table_name in tables:

    table_name = table_name[0]

    cursor.execute(f"PRAGMA table_info({table_name});")

    columns = cursor.fetchall()

    print(f"Table: {table_name}")

    for column in columns:

        print(column)

    print("")



conn.close()




def null_check(target_cursor, target_table):

        target_cursor.execute(
            'SELECT Id FROM {} WHERE name is NULL'.format(target_table))
        all_results = []
        try:
                    for row in target_cursor:
                        for null_row in row:
                            all_results.append(f"id:{null_row}")
                    des_value = "\n".join(all_results)
                    if all_results:
                        return {"res": 0, "src_value": None,
                                "des_value": des_value}
                    else:
                        return {"res": 1, "src_value": None,
                                "des_value": "Null Values Does not Exist"}

        except Exception as e:
            print(e)
            return {"res": 2, "src_value": None, "des_value": None}

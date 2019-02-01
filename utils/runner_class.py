import time
from models.user import SparkJob

import requests

from models.user import TestCaseLog, TestCase
from utils.countcheck import count_check
from utils.dbconnect import source_db, dest_db
from utils.duplication import duplication
from utils.nullcheck import null_check
from utils.ddlcheck import ddl_check
import sqlalchemy
from resources.sparkjob import SparkJobStatus

def split_table(table_name):
    """
    :param table_name: gets table_src_target value stored in TestSuite table
    :return: returns a list consist of source and destination db.
    """

    lst1 = []
    lst = table_name.strip(';').split(':')
    lst1.append(lst)
    return lst1


def save_case_log(test_case_id, execution_status,
                  src_execution_log,
                  des_execution_log,
                  error_log):
    temp = TestCaseLog(test_case_id=test_case_id,
                       execution_status=execution_status,
                       src_execution_log=src_execution_log,
                       des_execution_log=des_execution_log,
                       error_log=error_log)
    temp.save_to_db()
    return temp


def save_test_status(test_case_id, status):
    """

    :param test_case_id : utils case object.
    :param status: test_status of Testcase object
    :return: just store value in db.
    """
    test_case_id.test_status = status
    test_case_id.save_to_db()
    return True


def split_db(test_db_detail):
    lst1 = []
    lst2 = []
    strip_db_detail = test_db_detail.strip("@'").split("'@")
    for i in range(len(strip_db_detail)):
        lst1.append(strip_db_detail[i].split(':'))
    lst2.append(lst1[2][1].strip('\n'))
    lst2.append(lst1[4][1].strip('\n'))
    lst2.append(lst1[0][1].strip('\n'))
    lst2.append(lst1[3][1].strip('\n'))
    return lst2


def run_by_case_id(test_case_id):
    """
    :param test_case_id: recieves case_id to be tested.
    :return: just run the utils case.
    """
    test_case = TestCase.query.filter_by(test_case_id=test_case_id).first()
    run_test(test_case)
    return True


def run_test(case_id):
    """
    :param case_id: case_id is test_case_id
    :return: it does the utils on test_case_id based on  its test_name
    """
    save_test_status(case_id, 3)
    case_log = save_case_log(case_id.test_case_id, None, None, None, None)
    if case_id.test_status == 3:
        if case_id.test_name == 'CountCheck':  # 1st Test
            db_type = split_db(case_id.test_detail)
            source_cursor = source_db(db_type[0][1:], db_type[2][1:]).cursor()
            target_cursor = dest_db(db_type[1][1:], db_type[3][1:]).cursor()
            table_name = split_table(case_id.table_src_target)
            result = count_check(source_cursor,
                                 target_cursor,
                                 table_name[0][0],
                                 table_name[0][1])

        if case_id.test_name == 'NullCheck':  # 2nd Test
            db_type = split_db(case_id.test_detail)
            target_cursor = dest_db(db_type[1][1:], db_type[3][1:]).cursor()
            table_name = split_table(case_id.table_src_target)
            result = null_check(target_cursor, table_name[0][1])

        if case_id.test_name == 'DuplicateCheck':  # 3 Test
            db_type = split_db(case_id.test_detail)
            target_cursor = dest_db(db_type[1][1:], db_type[3][1:]).cursor()
            table_name = split_table(case_id.table_src_target)
            result = duplication(target_cursor=target_cursor,
                                 target_table=table_name[0][1])
        if case_id.test_name == 'Datavalidation':
            db_type = split_db(case_id.test_detail)
            source_cursor = source_db(db_type[0][1:], db_type[2][1:]).cursor()
            print(db_type)
            table_name = split_table(case_id.table_src_target)
            print(table_name)
            target_cursor = dest_db(db_type[1][1:], db_type[3][1:]).cursor()
            table_name = split_table(case_id.table_src_target)
            # r = datavalidation(db_type[1][1:],db_type[3][1:])
            spark_job=SparkJob()

            spark_job.save_to_db()
            spark_job.test_case_log_id=case_log.test_case_log_id
            spark_job.save_to_db()
            print("primary key", spark_job.spark_job_id)
            payload = dict({"file": "/spark_dw2.py", "jars": ["/mysql-connector-java.jar"], "args": [db_type[0][1:], table_name[0][0], db_type[1][1:], table_name[0][1], spark_job.spark_job_id]})
            r = requests.post('http://127.0.0.1:8998/batches', json=payload)
            res = {}
            res = r.json()
            print(res['id'])
            print(res['state'])
            spark_job.job_id=res['id']
            spark_job.status=res['state']
            spark_job.save_to_db()
            # temp=SparkJob(job_id=res['id'],status=res['state'])
            # temp.save_to_db()
            time.sleep(2)
            #result = requests.get('http://127.0.0.1:8998/batches/{0}'.format(res['id']))
            #print(result.json()['log'])
            #res = SparkJobStatus.get()
            result = {'res': 3, "src_value": "none", "des_value": "none"}


        if case_id.test_name == 'DDLCheck':
            db_type = split_db(case_id.test_detail)
            print(db_type)
            table_name = split_table(case_id.table_src_target)
            print(table_name)
            source_cursor = source_db(db_type[0][1:], db_type[2][1:]).cursor()
            target_cursor = dest_db(db_type[1][1:], db_type[3][1:]).cursor()
            result = ddl_check(source_cursor, target_cursor, table_name[0][0], table_name[0][1])

        if result['res'] == 1:
            save_test_status(case_id, 1)# TestCase object.
            case_log.execution_status = 1
            case_log.src_execution_log = result['src_value']
            case_log.des_execution_log = result['des_value']
            case_log.error_log = None
            case_log.save_to_db()
            # save_case_log(case_id.test_case_id,
            #               case_id.test_status, result['src_value'],
            #               result['des_value'], None)
        elif result['res'] == 3:
            save_test_status(case_id, 3)  # TestCase object.
            case_log.execution_status = 3
            case_log.src_execution_log = result['src_value']
            case_log.des_execution_log = result['des_value']
            case_log.error_log = None
            case_log.save_to_db()

        elif result['res'] == 0:
            save_test_status(case_id, 2)
            case_log.execution_status = 2
            case_log.src_execution_log = result['src_value']
            case_log.des_execution_log = result['des_value']
            case_log.error_log = None
            case_log.save_to_db()

        elif result['res'] == 2:  # 2 is error (except case)
            save_test_status(case_id, 4)
            case_log.execution_status = 4
            case_log.src_execution_log = result['src_value']
            case_log.des_execution_log = result['des_value']
            case_log.error_log = None
            case_log.save_to_db()


    return True

# ToNote:
# status = {0: "new", 1: "pass", 2: "fail", 3: "in progress", 4: "error"}
# test_case_result = {1: "pass", 0: "fail", 2: "error"}

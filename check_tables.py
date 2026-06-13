from database import get_connection


REQUIRED_TABLES = ["spendwise", "budget_setups", "expenses"]


def table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        """
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = %s
        );
        """,
        (table_name,),
    )
    return bool(cursor.fetchone()[0])


def trigger_exists(cursor) -> bool:
    cursor.execute(
        """
        SELECT EXISTS (
            SELECT 1
            FROM pg_trigger trigger_info
            JOIN pg_class table_info ON table_info.oid = trigger_info.tgrelid
            JOIN pg_namespace schema_info ON schema_info.oid = table_info.relnamespace
            WHERE schema_info.nspname = 'auth'
              AND table_info.relname = 'users'
              AND trigger_info.tgname = 'on_auth_user_created'
              AND NOT trigger_info.tgisinternal
        );
        """
    )
    return bool(cursor.fetchone()[0])


def function_exists(cursor) -> bool:
    cursor.execute(
        """
        SELECT EXISTS (
            SELECT 1
            FROM pg_proc proc_info
            JOIN pg_namespace schema_info ON schema_info.oid = proc_info.pronamespace
            WHERE schema_info.nspname = 'public'
              AND proc_info.proname = 'handle_new_user'
        );
        """
    )
    return bool(cursor.fetchone()[0])


def check_database_objects() -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            for table_name in REQUIRED_TABLES:
                if not table_exists(cursor, table_name):
                    raise RuntimeError(f"Missing table: public.{table_name}")
                print(f"Table found: public.{table_name}")

            if not function_exists(cursor):
                raise RuntimeError("Missing trigger function: public.handle_new_user")
            print("Trigger function found: public.handle_new_user")

            if not trigger_exists(cursor):
                raise RuntimeError("Missing trigger: auth.on_auth_user_created")
            print("Trigger found: auth.users.on_auth_user_created")


if __name__ == "__main__":
    check_database_objects()
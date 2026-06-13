from database import get_connection


def test_database_connection() -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()


if __name__ == "__main__":
    test_database_connection()
    print("Database connection successful")
// Content for course.html — the page shows the course named in ?course=
// Lesson numbers are continuous across modules and are computed in course.js.
export const DEFAULT_COURSE = "python";

export const COURSES = {
  python: {
    name: "Python з нуля",
    sub: "Опануй Python з нуля та створи свій перший повноцінний проєкт",
    nodes: ["Python", "Логіка", "ООП", "Архітектура", "Telegram API", "Фінал"],
    modules: [
      { title: "Базовий синтаксис: від перших змінних до керування даними", lessons: [
        "Введення в Python та базові об'єкти", "Boolean, порівняння та рядки", "Методи рядків", "Умови та списки", "Методи списків"] },
      { title: "Алгоритми та структури: обробка великих масивів даних та файлів", lessons: [
        "Цикли for та while", "Кортежі та множини", "Словники", "Файли: TXT → JSON → CSV", "Функції"] },
      { title: "Об'єктно-орієнтоване програмування та архітектура проектів", lessons: [
        "Просунуті можливості Python", "Виключення та обробка помилок", "Введення в ООП", "Просунуте ООП", "Архітектура Python-проєкту"] },
      { title: "Практика: проектування та розробка консольного магазину", lessons: [
        "Збірка повноцінного магазину", "Кошик та замовлення", "Полірування консольного магазину", "Підготовка магазину до Telegram", "Telegram Bot — основи"] },
      { title: "Інтеграція з Telegram: створення бот-магазину та захист проекту", lessons: [
        "Telegram-магазин", "Кошик та замовлення в Telegram", "Git та GitHub — повноцінна робота", "Фінальне заняття та підготовка власного проєкту", "Захист власного проєкту"] },
    ],
  },

  django: {
    name: "Python + Django",
    sub: "Навчись будувати вебсервіси: від моделей і маршрутів до REST API та розгортання",
    nodes: ["Django", "Django ORM", "Бізнес-логіка", "DRF API", "Docker / Celery", "Фінал"],
    modules: [
      { title: "Основи веб-розробки та знайомство з Django", lessons: [
        "Web і Django: як все працює", "HTML + CSS для Django", "Django Templates, URLs і Views", "Архітектура шаблонів і static", "Models і Django ORM: початок", "PostgreSQL + pgAdmin"] },
      { title: "Робота з базами даних та оптимізація ORM", lessons: [
        "Зв'язки між моделями", "ORM: вибірка та фільтрація", "Складні ORM-запити", "Advanced ORM та оптимізація", "Aggregation та аналітика ORM", "Django Admin"] },
      { title: "Створення користувачів та логіка бронювання", lessons: [
        "Django Forms", "Authentication", "Profiles, ролі та permissions", "CRUD та архітектура додатка", "Search, filters та pagination",
        "Модель бронювання та бізнес-логіка", "Перевірка доступності", "Transactions та цілісність даних", "Service Layer та архітектура"] },
      { title: "Розробка API (Django REST Framework)", lessons: [
        "Django REST Framework", "Serializers, ViewSets та Routers", "API: filtering, search та pagination", "JWT Authentication", "API Permissions та Security", "API бронювань", "API Documentation та Testing"] },
      { title: "Налаштування процесів, Docker та фінальний проєкт", lessons: [
        "Media, зображення та email", "Background Tasks: Celery + Redis", "GitHub, Docker та deployment", "Фінальна збірка та захист проєкту"] },
    ],
  },

  data: {
    name: "Python Data Analytics",
    sub: "Навчись працювати з даними: чистити, аналізувати та показувати висновки наочно",
    nodes: ["Python", "Pandas EDA", "Статистика", "SQL Бази", "Power BI", "Фінал"],
    modules: [
      { title: "Базовий аналіз: обробка та підготовка даних у Pandas", lessons: [
        "Jupyter Notebook та Python для аналітика", "NumPy: масиви та обчислення", "NumPy для аналізу даних", "Pandas: Series та DataFrame", "Вибірка та зміна даних в Pandas", "Групування та агрегація"] },
      { title: "Продвинута аналітика: очищення даних та дослідження (EDA)", lessons: [
        "Об'єднання таблиць в Pandas", "Очищення даних", "Робота з датами та часом", "Підготовка даних до аналізу", "EDA: дослідницький аналіз даних", "Бізнес-метрики та KPI", "Просунутий аналіз в Pandas"] },
      { title: "Візуалізація даних та статистика для бізнесу", lessons: [
        "Matplotlib: візуалізація даних", "Seaborn та статистичні графіки", "Візуальна аналітика та storytelling", "Статистика для Data Analyst", "Кореляція та перевірка гіпотез"] },
      { title: "Робота з базами даних: від базового до просунутого SQL", lessons: [
        "PostgreSQL: основи SQL", "SQL: фільтрація та агрегація", "SQL JOIN", "Просунутий SQL", "Віконні функції SQL", "SQL: повноцінний аналітичний кейс", "Python + PostgreSQL"] },
      { title: "Бізнес-аналітика в Power BI та захист фінального проекту", lessons: [
        "Power BI: початок роботи", "Power BI: модель даних", "Power BI: аналітичний Dashboard", "Фінальний проєкт: бізнес-аналітика компанії", "Захист аналітичного проєкту"] },
    ],
  },
};
# Wiki Chatbot

### Simple Chatbot using NLTK and Wikipedia API:

This chatbot is built using a combination of several technologies to create a robust and interactive user experience. Wikipedia API is used for data extraction, Flask is the web framework used to build the backend of the chatbot, while Python provides the core functionality for data processing and manipulation.

- Wikipedia API: A Python wrapper for Wikipedias’ API. It supports extracting texts, sections, links, categories, translations, etc from Wikipedia.
- Flask: A lightweight web framework used to build the backend of the chatbot.
- Python: The programming language that provides the core functionality for data processing and manipulation.
- Angular: A popular framework for building dynamic web applications, used to provide seamless interactivity between the frontend and backend.
- MongoDB: A NoSQL database used to store and manage user data and chat histories.

---

## Getting Started

### Dependencies

- MongoDB
- Python 3.10
- Node.js
- Angular

### Executing program

1. Clone this repository 

```bash
git clone https://github.com/nikhilpatil12/wiki-chatbot
```

2. cd into the downloded sourcecode

```bash
cd wiki-chatbot
```

3. Install python requirements

```bash
pip install -r py-requirements.txt
```

4. Install en_core_web_sm model

```bash
python -m spacy download en_core_web_sm
```

5. Rename "key_emaple.py" to "key.py" and place your OpenAI API Key and MongoDB credentials there
6. Execute "python app.py" to run the backend dev server

```bash
python app.py
```

7. Change directory to chatbot-ui:

```bash
cd chatbot-ui
```

8. Run the following command to install the dependencies listed in the package.json file

```bash
npm install
```

9. Once the installation is complete, run the following command to run the Angular dev server, Make sure you have Angular cli installed

```
ng serve -o
```

## Built With

[![Angular][angular-logo]][angular-url]
[![Python][python-logo]][python-url]
[![Flask][flask-logo]][flask-url]
[![Mongo][mongo-logo]][mongo-url]

## Authors

- Nikhil Patil
- [@nikhilpatil12](https://www.linkedin.com/in/nikhilpatil12/)
-Harika Kolli


## Version History

- 0.1
  - Initial Release

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[angular-logo]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[angular-url]: https://angular.io/
[python-logo]: https://img.shields.io/badge/Python-0066FF?style=for-the-badge&logo=python&logoColor=white
[python-url]: https://www.python.org/
[flask-logo]: https://img.shields.io/badge/Flask-000?style=for-the-badge&logo=flask&logoColor=white
[flask-url]: https://flask.palletsprojects.com/en/2.2.x/
[mongo-logo]: https://img.shields.io/badge/MongoDB-009933?style=for-the-badge&logo=mongodb&logoColor=white
[mongo-url]: https://www.mongodb.com/

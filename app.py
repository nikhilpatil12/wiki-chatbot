from flask import Flask, request, jsonify, stream_with_context, Response
from pymongo import MongoClient
import wikipedia
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
import spacy
import datetime
import random
from flask_cors import CORS
import bcrypt
import openai
from key import OPENAI_API_KEY, MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_AUTHSOURCE
openai.organization = "org-O0EuSUECzQKgULsX7tVYOsy7"
openai.api_key = OPENAI_API_KEY
# Load Spacy NER
nlp = spacy.load('en_core_web_sm')
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')

# Create the Flask app
app = Flask(__name__)
CORS(app, origins=['*'])

client = MongoClient('localhost', 27017, username=MONGODB_USERNAME,
                     password=MONGODB_PASSWORD, authSource=MONGODB_AUTHSOURCE)

db = client.chatbot
history = db.history
users = db.users

errors = ["404: Answer not found.",  "I'm sorry, Dave. I'm afraid I can't do that.",  "To be or not to be, that is the question... that I can't answer.",  "I'm stumped. Can we talk about something else?",  "Hmm, let me consult my Magic 8 Ball... 'Reply hazy, try again'.",  "I'm at a loss for words. How about we change the subject?",  "I think I need a coffee break. Let's chat later.",  "The answer is blowing in the wind... but I don't know what it is.",  "I'm afraid I don't have a clue. Maybe Google does?",  "You got me. I have no idea. How about a joke instead?",
          "Sorry, I'm not programmed to answer that.",  "I'm not sure what you're asking. Can you try rephrasing the question?",  "I'm afraid I'm not qualified to answer that.",  "The answer is somewhere over the rainbow... but not in my database.",  "I'm afraid that's classified information.",  "I'm sorry, my crystal ball is currently out of order.",  "The answer eludes me. Maybe you have a better idea?",  "I'm as clueless as a fish out of water.",  "Hmm, that's a tough one. Let me think...",  "I'm afraid I can't answer that without a lawyer present."]

# Preprocess the user's question


def preprocess(question):
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    tokens = word_tokenize(question)
    filtered_tokens = [lemmatizer.lemmatize(
        w.lower()) for w in tokens if not w in stop_words]
    print("filtered_tokens")
    return filtered_tokens

# Retrieve the Wikipedia page for the given question


def get_wiki_page(question):
    query = " ".join(preprocess(question))
    print('Question Topic: '+query)
    try:
        page = wikipedia.page(query)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return wikipedia.page(e.options[0]).content

# Extract relevant data from the Wikipedia page


def extract_data(page_content):
    entities = []
    sentences = sent_tokenize(page_content)
    for sentence in sentences:
        doc = nlp(sentence)
        for ent in doc.ents:
            print(ent)
            if ent.label_ in ["GPE", "LOC", "ORG", "PERSON"]:
                entities.append(ent.text)
                print('Extracted data: ' + ent.text)
                yield f"Loading: \n".encode()
        for entity in doc:
            if entity.i >= doc[0].i and entity.i <= doc[-1].i:
                if entity.dep_ in ["nsubj", "ROOT", "pobj",  "dobj", "nsubjpass"] and entity.text not in entities:
                    entities.append(entity.text)
                    yield f"Loading: \n".encode()
    return list(set(entities)), sentences

# Answer the user's question using the extracted data


def answer_question(question, extracted_data):
    # Extract entities from the question
    question_doc = nlp(question)
    print("question_doc.ents")
    print(question_doc.ents)
    question_entities = []
    for ent in question_doc.ents:
        print("ent.label_")
        print(ent.label_)
        if ent.label_ in ["GPE", "LOC", "ORG", "PERSON"]:
            question_entities.append(ent.text)
            yield f"Question entity found: {ent.text} \n".encode()
    for entity in question_doc:
        # print(ent)
        if entity.i >= question_doc[0].i and entity.i <= question_doc[-1].i:
            if entity.dep_ in ["nsubj", "ROOT", "pobj",  "dobj", "nsubjpass"] and entity.text not in question_entities:
                question_entities.append(entity.text)
                yield f"Question entity found: {entity.text} \n".encode()

    print("question_entities")
    print(question_entities)

    # Find the sentence in the Wikipedia page that contains the most entities from the question
    max_entities = 0
    best_sentence = None
    for sentence in extracted_data[1]:
        doc = nlp(sentence)
        sentence_entities = []
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "ORG", "PERSON"]:
                sentence_entities.append(ent.text)
                # yield 'Answer entity found: ' + ent.text + '\n'
        for entity in doc:
            # print(ent.dep_)
            if entity.i >= doc[0].i and entity.i <= doc[-1].i:
                if entity.dep_ in ["nsubj", "ROOT", "pobj",  "dobj", "nsubjpass"] and entity.text not in sentence_entities:
                    sentence_entities.append(entity.text)
                    # yield 'Answer entity found: ' + entity.text + '\n'
        print(sentence_entities)
        # yield str(list(set(sentence_entities).intersection(set(question_entities)))).encode()
        num_entities = len(
            set(sentence_entities).intersection(set(question_entities)))
        print(num_entities)
        if num_entities > max_entities:
            max_entities = num_entities
            best_sentence = sentence
            yield f"[{str(num_entities)}] Possible Answer: {str(sentence)} \n".encode()

    # If a sentence with at least one entity from the question is found, return the sentence
    if max_entities > 0:
        yield f"Answer: {str(best_sentence)} \n".encode()
        return best_sentence

    # If no match is found, return random.choice(errors)
    return random.choice(errors)

# Define the API route


@app.route('/api/answer', methods=['POST', 'OPTIONS'])
def answer():
    try:
        if request.method == 'OPTIONS':
            response = Response()
            response.headers.add(
                'Access-Control-Allow-Origin', '*')
            response.headers.add(
                'Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add(
                'Access-Control-Allow-Headers', 'Content-Type')
            return response
        if request.method == 'POST':
            # Get the user's question from the request body
            data = request.json
            question = data['question']
            model = data['model']
            thread = data['thread']
            user = data['user']
            # Stream extracted data from extract_data()

            def generate():
                if model == "wikibot":
                    # Get the Wikipedia page for the question
                    page_content = get_wiki_page(question)
                    # Extract the relevant data
                    extracted_data = yield from extract_data(page_content)
                    # yield str(extracted_data)
                    # print(extracted_data)

                    # Answer the user's question
                    answer = yield from answer_question(question, extracted_data)

                    # ts stores the time in seconds
                    ts = datetime.datetime.now()

                    history.insert_one(
                        {'question': question, 'answer': answer, 'ts': ts, 'thread': thread, 'user': user, 'model': model})
                else:
                    chatgptresponse = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": question}],
                        max_tokens=80
                    )
                    print(chatgptresponse)
                    ts = datetime.datetime.now()

                    history.insert_one(
                        {'question': question, 'answer': chatgptresponse.choices[0].message.content, 'ts': ts, 'thread': thread, 'user': user, 'model': model})
                    return jsonify(chatgptresponse)
            response = Response(stream_with_context(
                generate()), content_type='text/event-stream', mimetype='text/plain')
            response.headers.add('Access-Control-Allow-Origin',
                                 '*')
            response.headers.add('Transfer-Encoding', 'chunked')
            response.status_code = 200
            response.direct_passthrough = True
            response.headers.add(
                'Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add(
                'Access-Control-Allow-Headers', 'Content-Type')
            return response

    except:
        question = data['question']
        ts = datetime.datetime.now()

        err = random.choice(errors)
        history.insert_one(
            {'question': question, 'answer': err, 'ts': ts, 'thread': thread})
        response = jsonify(
            {'question': question, 'error': err, 'ts': ts, 'thread': thread})
        response.headers.add('Access-Control-Allow-Origin',
                             '*')
        return response


@app.route('/api/history', methods=['GET'])
def hist():
    # chat_history = history.find()
    ch = []
    user = request.args.get('user')
    query = {"user": user}
    print(query)
    chat_history = history.find(query)

    for chat in chat_history:
        thread = "Default"
        if 'thread' in chat:
            if chat['thread'] != "":
                thread = chat['thread']
        model = 'wikibot'
        if 'model' in chat:
            if chat['model'] != "":
                model = chat['model']

        ch.append({'question': chat['question'],
                  'answer': chat['answer'],
                   'ts': chat['ts'],
                   'model': model,
                   'thread': thread})
    chatdict = arrange_by_thread(ch)
    response = jsonify(chatdict)
    print(chatdict)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    try:
        if request.method == 'OPTIONS':
            response = Response()
            response.headers.add(
                'Access-Control-Allow-Origin', '*')
            response.headers.add(
                'Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add(
                'Access-Control-Allow-Headers', 'Content-Type')
            return response
        if request.method == 'POST':
            # Get the user's question from the request body
            data = request.json
            print(data)
            fname = data['fname']
            print(fname)
            lname = data['lname']
            print(lname)
            email = data['email']
            print(email)
            password = data['password']
            print(password)
            hashed_password = bcrypt.hashpw(
                password.encode('utf-8'), bcrypt.gensalt())
            print(hashed_password)

            query = {"email": email}
            print(query)
            cursor = users.find(query)
            for c in cursor:
                print(c)
                print(bcrypt.checkpw(password.encode('utf-8'), c["password"]))
                if(bcrypt.checkpw(password.encode('utf-8'), c["password"])):
                    print(email)
                    loginresp = jsonify(
                        {'success': False, 'message': 'User already exists!', 'user': email})
                    return loginresp
            users.insert_one({'fname': fname, 'lname': lname,
                             'email': email, 'password': hashed_password})
            # response = Response(
            #     data)
            # response.headers.add('Access-Control-Allow-Origin',
            #                      '*')
            # response.status_code = 200
            # response.headers.add(
            #     'Access-Control-Allow-Methods', 'POST, OPTIONS')
            # response.headers.add(
            #     'Access-Control-Allow-Headers', 'Content-Type')
            return jsonify({'success': True, 'message': 'Signup successful!'})

    except:
        print("Error")
        response = jsonify(
            {'error': "Something Went wrong", })
        response.headers.add('Access-Control-Allow-Origin',
                             '*')
        return response


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        if request.method == 'OPTIONS':
            response = Response()
            response.headers.add(
                'Access-Control-Allow-Origin', '*')
            response.headers.add(
                'Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add(
                'Access-Control-Allow-Headers', 'Content-Type')
            return response
        if request.method == 'POST':
            # Get the user's question from the request body
            data = request.json
            email = data['email']
            print(email)
            password = data['password']
            print(password)
            query = {"email": email}
            print(query)
            cursor = users.find(query)
            for c in cursor:
                print(c)
                print(c["password"])
                print(bcrypt.checkpw(password.encode('utf-8'), c["password"]))
                if(bcrypt.checkpw(password.encode('utf-8'), c["password"])):
                    print(email)
                    loginresp = jsonify(
                        {'success': True, 'message': 'Login successful!', 'user': {'email': email, 'fullname': c["fname"] + " "+c["lname"]}})
                    return loginresp
                else:
                    loginresp = jsonify(
                        {'success': False, 'message': 'Login ussuccessful!', 'reason': "Wrong password!"})
                    return loginresp
            return jsonify({'success': False, 'message': 'Login ussuccessful!', 'reason': "User not found"})
    except:
        response = jsonify(
            {'error': "Something Went wrong", })
        response.headers.add('Access-Control-Allow-Origin',
                             '*')
        return response


def arrange_by_thread(chat_list):
    chat_dict = {}
    for chat in chat_list:
        thread = chat['thread']
        if thread not in chat_dict:
            chat_dict[thread] = []
        chat_dict[thread].append({
            'question': chat['question'],
            'answer': chat['answer'],
            'ts': chat['ts'],
            'model': chat['model']
        })
    return chat_dict


if __name__ == '__main__':
    app.run(debug=True)

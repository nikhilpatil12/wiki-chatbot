from flask import Flask, request, jsonify
from pymongo import MongoClient
import wikipedia
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
import spacy
import datetime
import random

# Load Spacy NER
nlp = spacy.load('en_core_web_sm')

# Create the Flask app
app = Flask(__name__)

client = MongoClient('localhost', 27017)

db = client.chatbot
history = db.history

errors = ["404: Answer not found.",  "I'm sorry, Dave. I'm afraid I can't do that.",  "To be or not to be, that is the question... that I can't answer.",  "I'm stumped. Can we talk about something else?",  "Hmm, let me consult my Magic 8 Ball... 'Reply hazy, try again'.",  "I'm at a loss for words. How about we change the subject?",  "I think I need a coffee break. Let's chat later.",  "The answer is blowing in the wind... but I don't know what it is.",  "I'm afraid I don't have a clue. Maybe Google does?",  "You got me. I have no idea. How about a joke instead?",
          "Sorry, I'm not programmed to answer that.",  "I'm not sure what you're asking. Can you try rephrasing the question?",  "I'm afraid I'm not qualified to answer that.",  "The answer is somewhere over the rainbow... but not in my database.",  "I'm afraid that's classified information.",  "I'm sorry, my crystal ball is currently out of order.",  "The answer eludes me. Maybe you have a better idea?",  "I'm as clueless as a fish out of water.",  "Hmm, that's a tough one. Let me think...",  "I'm afraid I can't answer that without a lawyer present."]

# Preprocess the user's question


def preprocess(question):
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    tokens = word_tokenize(question)
    filtered_tokens = [lemmatizer.lemmatize(
        w.lower()) for w in tokens if not w in stop_words]
    return filtered_tokens

# Retrieve the Wikipedia page for the given question


def get_wiki_page(question):
    query = " ".join(preprocess(question))
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
            if ent.dep_ in ["nsubj", "ROOT", "pobj",  "dobj"]:
                entities.append(ent.text)
    print(sentences)
    return list(set(entities)), sentences

# Answer the user's question using the extracted data


def answer_question(question, extracted_data):
    # Extract entities from the question
    question_doc = nlp(question)
    question_entities = []
    for ent in question_doc.ents:
        if ent.dep_ in ["nsubj", "ROOT", "pobj",  "dobj"]:
            question_entities.append(ent.text)

    # Find the sentence in the Wikipedia page that contains the most entities from the question
    max_entities = 0
    best_sentence = None
    for sentence in extracted_data[1]:
        doc = nlp(sentence)
        sentence_entities = []
        for ent in doc.ents:
            if ent.dep_ in ["nsubj", "ROOT", "pobj",  "dobj"]:
                sentence_entities.append(ent.text)
        num_entities = len(
            set(sentence_entities).intersection(set(question_entities)))
        if num_entities > max_entities:
            max_entities = num_entities
            best_sentence = sentence

    # If a sentence with at least one entity from the question is found, return the sentence
    if max_entities > 0:
        return best_sentence

    # If no match is found, return random.choice(errors)
    return random.choice(errors)

# Define the API route


@app.route('/api/answer', methods=['POST'])
def answer():
    try:
        # Get the user's question from the request body
        data = request.json
        question = data['question']

        # Get the Wikipedia page for the question
        page_content = get_wiki_page(question)

        # Extract the relevant data
        extracted_data = extract_data(page_content)

        # Answer the user's question
        answer = answer_question(question, extracted_data)

        # ts stores the time in seconds
        ts = datetime.datetime.now()

        history.insert_one({'question': question, 'answer': answer, 'ts': ts})

        # Return the answer as a JSON response
        return jsonify({'question': question, 'answer': answer, 'ts': ts})
    except:
        question = data['question']
        ts = datetime.datetime.now()

        err = random.choice(errors)
        history.insert_one({'question': question, 'answer': err, 'ts': ts})
        response = jsonify({'question': question, 'error': err})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


# Define the API route
@app.route('/api/history', methods=['GET'])
def hist():
    chat_history = history.find()
    ch = []
    for chat in chat_history:
        ch.append({'question': chat['question'],
                  'answer': chat['answer'], 'ts': chat['ts']})
    response = jsonify(ch)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    app.run(debug=True)

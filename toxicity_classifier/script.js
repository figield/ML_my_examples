import '@tensorflow/tfjs-backend-webgl';
import * as toxicity from '@tensorflow-models/toxicity';

const threshold = 0.9;
const labels = [ // removal of some of these labels make inference somewhat faster
    "identity_attack",
    "insult",
    "obscene",
    "severe_toxicity",
    "sexual_explicit",
    "threat",
    "toxicity",
];

let model;

window.addEventListener('load', async function () {
    model = await toxicity.load(threshold, labels); // add second param: labels
})


const POST_COMMENT_BTN = document.getElementById('post');
const COMMENT_TEXT = document.getElementById('comment');
const COMMENTS_LIST = document.getElementById('commentsList');
// CSS styling class to indicate comment is being processed when
// posting to provide visual feedback to users.
const PROCESSING_CLASS = 'processing';

var currentUserName = 'Anonymous';

async function loadAndPredict(value) {
    const predictions = model.classify([value]);
    const processed_predictions = predictions.map((prediction) => (
        {
            label: prediction.label,
            match: prediction.results[0].match,
            probabilities: prediction.results[0].probabilities,
        }
    ))
    return processed_predictions;
}

async function present_predictions(predictions) {
    // POST_COMMENT_BTN.classList.remove(PROCESSING_CLASS);
    // COMMENT_TEXT.classList.remove(PROCESSING_CLASS);
    let li = document.createElement('li');

    let p = document.createElement('p');
    p.innerText = COMMENT_TEXT.innerText;
    console.log("Copy innerText:" + COMMENT_TEXT.innerText)

    let spanName = document.createElement('span');
    spanName.setAttribute('class', 'username');
    spanName.innerText = currentUserName;

    let spanDate = document.createElement('span');
    spanDate.setAttribute('class', 'timestamp');
    let curDate = new Date();
    spanDate.innerText = curDate.toLocaleString();

    let p2 = document.createElement('p');
    p2.className = 'results';
    p2.innerText = '';
    p2.innerHTML = predictions.map(prediction => {

        let match = 'unknown';
        if (prediction.match === true)
            match = 'yes';
        else if (prediction.match === false)
            match = 'no';

        const yes_probability = Number(prediction.probabilities[0]).toString().slice(0, 5);
        const no_probability = Number(prediction.probabilities[1]).toString().slice(0, 5);

        return `<div class="prediction">
            <div class="label">${prediction.label}</div>
            <div class="value">${match}</div>
            <div class="probabilities"><div>${yes_probability}</div><div>${no_probability}</div></div>
        </div>`
    }).join('\n');

    li.appendChild(spanName);
    li.appendChild(spanDate);
    li.appendChild(p);
    li.appendChild(p2);
    COMMENTS_LIST.prepend(li);

    console.log("Reset comment text.")
    COMMENT_TEXT.innerText = '';
}

async function handleCommentPost() {
    // if (!POST_COMMENT_BTN.classList.contains(PROCESSING_CLASS)) {
    // POST_COMMENT_BTN.classList.add(PROCESSING_CLASS);
    // COMMENT_TEXT.classList.add(PROCESSING_CLASS);

    let currentComment = COMMENT_TEXT.innerText;
    // let lowercaseSentenceArray = currentComment.toLowerCase().replace(/[^\w\s]/g, ' ').split(' ');

    const predictions = await loadAndPredict(currentComment);
    console.log(predictions);
    await present_predictions(predictions);
    // }
}


POST_COMMENT_BTN.addEventListener('click', handleCommentPost);




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

async function present_predictions(predictions, input) {
    console.log(predictions);
    document.getElementById('results').className = "results";
    document.getElementById('results').innerText = '';
    let result = predictions.map(prediction => {
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

    document.getElementById('results').innerHTML = result;

    const COMMENTS_LIST = document.getElementById('commentsList');
    let li = document.createElement('li');
    let div = document.createElement('div');
    // p.innerText = COMMENT_TEXT.innerText;
    div.innerHTML = result;
    div.setAttribute('class', 'results');
    // console.log("Copy innerText:" + COMMENT_TEXT.innerText)

    let spanDate = document.createElement('span');
    spanDate.setAttribute('class', 'timestamp');
    let curDate = new Date();
    spanDate.innerText = curDate.toLocaleString() + ' - ' + input;

    li.appendChild(spanDate);
    li.appendChild(div);
    COMMENTS_LIST.prepend(li);
}

async function toxicity_model_infer(value) {
    const predictions = await model.classify([value]);
    const processed_predictions = predictions.map((prediction) => (
        {
            label: prediction.label,
            match: prediction.results[0].match,
            probabilities: prediction.results[0].probabilities,
        }
    ))
    return processed_predictions;
}

async function handle_form_submit() {

    if (!model) {
        console.warn('Model is not loaded!');
        return 1;
    }

    const input = document.getElementById('text-input-field').value;

    const processed_predictions = await toxicity_model_infer(input);
    await present_predictions(processed_predictions, input);

}

window.button_click_handler = handle_form_submit;

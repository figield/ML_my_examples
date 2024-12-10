/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as toxicity from '@tensorflow-models/toxicity';


const status = document.getElementById('status');
status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;

const POST_COMMENT_BTN = document.getElementById('post');
const COMMENT_TEXT = document.getElementById('comment');
const COMMENTS_LIST = document.getElementById('commentsList');
// CSS styling class to indicate comment is being processed when
// posting to provide visual feedback to users.
const PROCESSING_CLASS = 'processing';

// Store username of logged in user. Right now you have no auth
// so default to Anonymous until known.
var currentUserName = 'Anonymous';

/**
 * Function to handle the processing of submitted comments.
 **/
/**
 * Function to handle the processing of submitted comments.
 **/
function handleCommentPost() {
    // Only continue if you are not already processing the comment.
    if (!POST_COMMENT_BTN.classList.contains(PROCESSING_CLASS)) {
        // Set styles to show processing in case it takes a long time.
        POST_COMMENT_BTN.classList.add(PROCESSING_CLASS);
        COMMENT_TEXT.classList.add(PROCESSING_CLASS);

        // Grab the comment text from DOM.
        let currentComment = COMMENT_TEXT.innerText;
        // Convert sentence to lower case which ML Model expects
        // Strip all characters that are not alphanumeric or spaces
        let lowercaseSentence = currentComment.toLowerCase().replace(/[^\w\s]/g, ' ');

        // Create a list item DOM element in memory.
        let li = document.createElement('li');

        // Remember loadAndPredict is asynchronous so you use the then
        // keyword to await a result before continuing.
        loadAndPredict(lowercaseSentence, li).then(function () {
            // Reset class styles ready for the next comment.
            POST_COMMENT_BTN.classList.remove(PROCESSING_CLASS);
            COMMENT_TEXT.classList.remove(PROCESSING_CLASS);

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

            li.appendChild(spanName);
            li.appendChild(spanDate);
            li.appendChild(p);
            COMMENTS_LIST.prepend(li);

            console.log("Reset comment text.")
            COMMENT_TEXT.innerText = '';
        });


    }
}

POST_COMMENT_BTN.addEventListener('click', handleCommentPost);


async function loadAndPredict(sentence, domComment) {
    // Load the model.json and binary files you hosted. Note this is
    // an asynchronous operation so you use the await keyword
    console.log("start loadAndPredict")
    // The minimum prediction confidence.
    const threshold = 0.9;

    // Load the model. Users optionally pass in a threshold and an array of
    // labels to include.
    var results_final = await toxicity.load(threshold).then(async (model) => {
        const sentences = [sentence];
        let results = await model.classify(sentences).then(predictions => {
            // `predictions` is an array of objects, one for each prediction head,
            // that contains the raw probabilities for each input along with the
            // final prediction in `match` (either `true` or `false`).
            // If neither prediction exceeds the threshold, `match` is `null`.
            console.log("Predictions: ");
            console.log(predictions);
            return predictions;
        });
        return results;
    });

    // Print the result to the console for us to inspect.
    console.log("COMMENT_TEXT.innerText: " + COMMENT_TEXT.innerText);
    results_final.data().then((dataArray) => {
        console.log("dataArray:")
        console.log(dataArray)

        if (dataArray[1] > SPAM_THRESHOLD) {
            domComment.classList.add('spam');
            console.log("SPAM detected: " + COMMENT_TEXT.innerText);
        } else {
            // Emit socket.io comment event for server to handle containing
            // all the comment data you would need to render the comment on
            // a remote client's front end.
            console.log("Comment detected: " + COMMENT_TEXT.innerText);
            socket.emit('comment', {
                username: currentUserName,
                timestamp: domComment.querySelectorAll('span')[1].innerText,
                comment: domComment.querySelectorAll('p')[0].innerText
            });
        }
    })
    console.log("finish loadAndPredict")
}


//define the StoryState class
class StoryState {
    constructor() {
        //initialize variables to store the current node and background image
        this._currentNode = '';  //stores the current node (story frame)
        this._backgroundImage = '';  //stores the current background image
    }

    //getter for the current node
    get currentNode() {
        return this._currentNode;
    }

    //setter for the current node
    set currentNode(value) {
        this._currentNode = value;
    }

    //getter for the background image
    get backgroundImage() {
        return this._backgroundImage;
    }

    //setter for the background image
    set backgroundImage(value) {
        this._backgroundImage = value;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    //initialize StoryState object to keep the track of the current story state
    const storyState = new StoryState();

    let storyData = {}; // Variable to store the fetched story data

    //fetch the story data from the JSON file
    fetch('includes/data.json')
        .then(response => response.json())
        .then(data => {
            storyData = data;
            initializeStory(); //initialize the story after loading the data
        })
        .catch(error => {
            console.error('Error loading story data:', error);
        });

    function initializeStory() {
        let currentAudio = null;  //variable for the current audio file, initially set to null

        //function to play audio, stopping the current audio if a new one is provided
        function playAudio(audioUrl) {
            if (audioUrl) {
                if (currentAudio && currentAudio.src !== audioUrl) {
                    currentAudio.pause();  //stop current audio
                    currentAudio.currentTime = 0;  //reset current audio to the beginning
                }
                if (!currentAudio || currentAudio.src !== audioUrl) {
                    currentAudio = new Audio(audioUrl);  //load new audio
                    currentAudio.play();  //play new audio
                }
            }
        }

        //function to update the background image of the story
        function updateBackgroundImage(imageUrl) {
            const backgroundElement = document.getElementById('background'); //background image div
            backgroundElement.style.backgroundImage = `url(${imageUrl})`;  //set the background image
            storyState.backgroundImage = imageUrl;  //update the background image in the StoryState class
        }

        //if story frame has 2 background images, transition to second after delay
        function updateBackgroundImageWithTransition(primaryImageUrl, secondaryImageUrl, delay) {
            updateBackgroundImage(primaryImageUrl);  //set the primary background image
            setTimeout(() => {
                updateBackgroundImage(secondaryImageUrl);  //after delay, transition to secondary image
            }, delay);
        }

        //function for displaying story nodes
        function displayNode(nodeKey) {
            const node = storyData[nodeKey];  //retrieve the node from storyData
            storyState.currentNode = nodeKey;  //update the current node in the StoryState class

            const storyTextElement = document.getElementById('story-text'); //assign story node to story-text div
            const optionsElement = document.getElementById('options'); //assign options node to option div

            //update the background image based on the node data
            if (node.backgroundImage) {
                if (node.secondaryBackgroundImage) { //if 2 background images, pass to function for handling 2 background images and set 5 second delay
                    updateBackgroundImageWithTransition(node.backgroundImage, node.secondaryBackgroundImage, 5000);
                } else { //if 1 background image, display image
                    updateBackgroundImage(node.backgroundImage);
                }
            }

            //play audio if the node has an associated audio file
            if (node.audio) {
                playAudio(node.audio);
            }

            //display the story text in the storyTextElement
            storyTextElement.innerHTML = `<p>${node.text}</p>`;

            //clear any previous options displayed with empty string
            optionsElement.innerHTML = '';

            //display options for the next part of the story, if available
            if (node.options) {
                node.options.forEach(option => { //loop through options array inside node object
                    const button = document.createElement('button'); //create options buttons
                    button.className = 'custom-btn option-btn'; //attach custom button styling
                    button.innerHTML = `<span>${option.text}</span>`;
                    button.onclick = () => displayNode(option.next);  //set the onclick handler to display the next node
                    optionsElement.appendChild(button);  //add the button to the optionsElement
                });
            } else if (node.next) {
                //if there are no options but there is a next node, display a "Next" button
                const button = document.createElement('button');//create next button
                button.className = 'custom-btn'; //attach custom button styling
                button.innerHTML = `<span>Next</span>`;
                button.onclick = () => displayNode(node.next); //set the onclick handler to display the next node
                optionsElement.appendChild(button); //add the button to the optionsElement
            }
        }

        //function to update the visibility of the pillars based on screen size
        function updatePillarVisibility() {
            const width = window.innerWidth; // set width variable to width of viewport
            const pillar = document.getElementById('pillar'); //variable for pillar to be displayed in desktop view
            const horizontalPillar = document.getElementById('horizontal-pillar'); //variable for pillar to be displayed in mobile view
            if (width <= 767) {
                pillar.style.display = 'none';  //hide the vertical pillar on small screens
                horizontalPillar.style.display = 'block';  //show the horizontal pillar on small screens
            } else {
                pillar.style.display = 'block';  //show the vertical pillar on larger screens
                horizontalPillar.style.display = 'none';  //hide the horizontal pillar on larger screens
            }
        }

        //function to ensure the background is visible
        function updateBackgroundVisibility() {
            const background = document.getElementById('background');
            background.style.display = 'block'; //hardcode background display type to override css/bootstrap styling clashes
        }

        //create the button to begin the story
        const startButton = document.createElement('button'); //create button to start the story
        startButton.className = 'custom-btn';
        startButton.onclick = () => { //once button to start story is clicked:
            document.getElementById('story-text').style.display = 'block';  //show the story text container
            updatePillarVisibility();  //update pillar visibility based on screen width
            displayNode('intro');  //start the story by displaying the intro node
            updatePillarVisibility();  //ensure pillar visibility is correct
            updateBackgroundVisibility();  //ensure background is visible
            document.getElementById('start-button-container').removeChild(startButton);  //remove the start button
        };

        //add the start button to the start-button-container
        document.getElementById('start-button-container').appendChild(startButton);

        //call updatePillarVisibility initially and whenever the window is resized
        window.addEventListener('resize', updatePillarVisibility);
    }
});

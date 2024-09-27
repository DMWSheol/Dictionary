const form = document.getElementById("userForm");

const responseOutput = document.getElementById("response");
const errorResponse = document.getElementById("notAWord");

form.addEventListener("submit", checkWord);
async function checkWord(event){
  event.preventDefault();
  while(responseOutput.firstChild){responseOutput.removeChild(responseOutput.firstChild)} //clears the definiton field 
  while(errorResponse.firstChild){errorResponse.removeChild(errorResponse.firstChild)} //clears the error field 

  let word = document.getElementById("userWord").value; //gets user input 
  let splicedWord = Array.from(new Set(word.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"").split(" "))); //if there is multiple words, splits them into an array, removing all duplicates and all punctuation 

  console.log(splicedWord);

for(wordIndex in splicedWord){ //repeats for every submitted word
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${splicedWord[wordIndex]}`) //looks up the word in the dictionary api
  const data = await response.json(); //gets the word's json 
  let obj = {}; //empty object for the different definitions

  if(response.ok){ //if the word exists in the api

    for (i in data) {
      for (j in data[i].meanings) {
        const key = data[i].meanings[j].partOfSpeech;
        obj[key] = obj[key] || [];  

        for (l in data[i].meanings[j].definitions) {
          const { definition, example, synonyms, antonyms } = data[i].meanings[j].definitions[l];  
          const exampleString = example ? `\n   example: "${example}"` : "";
          const synonymString = synonyms?.length ? `\n   synonym(s): ${synonyms.join(', ')}` : "";
          const antonymString = antonyms?.length ? `\n   antonym(s): ${antonyms.join(', ')}` : "";
          
          obj[key].push(definition + exampleString + synonymString + antonymString);  // Add formatted string to array
        }
      }
    }

console.log(obj)
console.log(data);

    const { word, phonetic } = data[0];
    let outputWordNode = document.createElement("h2"); 
    outputWordNode.innerText = word;
    responseOutput.appendChild(outputWordNode); //outputs the searched word 

    let phoneticWordNode = document.createElement("h3");
    phoneticWordNode.setAttribute("title", "Play the Pronounciation")
    phoneticWordNode.innerText = phonetic || "";
    
    let phoneticAudioLink = (data[0].phonetics[0])? data[0].phonetics[0].audio : "null";
    phoneticAudioLink && phoneticWordNode.classList.add("audioPlay")
    let phoneticAudio = new Audio(phoneticAudioLink);
    phoneticWordNode.addEventListener('click', function() {phoneticAudioLink && phoneticAudio.play()});
    responseOutput.appendChild(phoneticWordNode); //outputs the phonetic spelling, or nothing if it is not found

    const keys = Object.keys(obj);
      keys.forEach(key => {
        const wordtypeParagraphNode = document.createElement('h3');
        wordtypeParagraphNode.innerText = key;
        responseOutput.appendChild(wordtypeParagraphNode);
          obj[key].forEach(definition => {
            const definitionParagraphNode = document.createElement('p');
            definitionParagraphNode.classList.add('output');
            definitionParagraphNode.innerText = definition;
            responseOutput.appendChild(definitionParagraphNode);
        });
    });
  }else{ //in case of a 404
    console.error("This is not a word")
    let outputWordNode = document.createElement("h2");
    outputWordNode.innerText = `${splicedWord[wordIndex]} is not a recognized word`;
    errorResponse.appendChild(outputWordNode);
  }
}
}
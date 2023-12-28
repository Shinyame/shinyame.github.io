// app.js
function calculateCombinations() {
    var budget = parseInt(document.getElementById('budget').value);
    var priceA = parseInt(document.getElementById('price_A').value);
    var priceB = parseInt(document.getElementById('price_B').value);
    var priceCInput = document.getElementById('price_C');
    var priceC = priceCInput ? parseInt(priceCInput.value) : 0;

    var combinations = [];

    for (var x = 0; x <= budget / priceA; x++) {
        for (var y = 0; y <= budget / priceB; y++) {
            if (!priceCInput || (priceCInput && priceC !== 0)) {
                for (var z = 0; z <= budget / priceC; z++) {
                    if (x * priceA + y * priceB + z * priceC === budget) {
                        combinations.push({ x: x, y: y, z: z });
                    }
                }
            } else {
                if (x * priceA + y * priceB === budget) {
                    combinations.push({ x: x, y: y });
                }
            }
        }
    }

    displayCombinations(combinations);
}

function displayCombinations(combinations) {
    var combinationsList = document.getElementById('combinations');
    combinationsList.innerHTML = '<li class="collection-header"><h4>Combinations</h4></li>';

    combinations.forEach(function (combination) {
        var listItem = document.createElement('li');
        listItem.className = 'collection-item';

        var displayText = '';

        if (combination.x !== 0) {
            displayText += 'Quantity of A: ' + combination.x;
        }

        if (combination.y !== 0) {
            if (displayText !== '') {
                displayText += ', ';
            }
            displayText += 'Quantity of B: ' + combination.y;
        }

        if ('z' in combination && combination.z !== 0) {
            if (displayText !== '') {
                displayText += ', ';
            }
            displayText += 'Quantity of C: ' + combination.z;
        }

        listItem.textContent = displayText;
        combinationsList.appendChild(listItem);
    });
}
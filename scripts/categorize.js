

console.log("Categorize.js loaded");

let rows = [];
let costCol = 0;
let descriptionCol = 0;
let currentRow = 0;
let currentData = {};

categories = ["Food(outside)", "Groceries", "Transportation", "Dates", "Subscriptions", "Clothes", "Income", "Events"];

let outputData = {}
let pastClassifications = {};

reloadCategoryButtons();

document.getElementById("expenseFileInput")?.addEventListener("change", (event) => {
    console.log("File input changed");
    const file = event.target.files[0];
    
    if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            rows = text.split("\n").map(row => row.split(","));
            categorizeExpenses();         
        };
        reader.readAsText(file);
        
    } else {
        alert("Please upload a valid CSV file.");
    }
});

document.getElementById("addCategoryButton")?.addEventListener("click", () => {
    let newCategory = document.getElementById("addCategoryInput").value;
    categories.push(newCategory);
    reloadCategoryButtons();
});

document.getElementById("downloadData")?.addEventListener("click", () => {
    downloadCSV(outputToCSV());
});

function outputToCSV() {
    let csv = "Category, Cost, Description, Total\n";
    let totalSum = 0;
    let positiveSum = 0;
    let negativeSum = 0;
    for (const category in outputData) {
        let categorySum = 0;
        for (const expense of outputData[category]) {
            csv += `${category}, ${expense[0]}, ${expense[1]},\n`;
            let expenseVal = parseFloat(expense[0]);
            categorySum += expenseVal;
            if (expenseVal > 0) {
                positiveSum += expenseVal;
            } else {
                negativeSum += expenseVal;
            }
        }
        csv += `${category}, , Total:, ${categorySum}\n`;
        totalSum += categorySum;
    }
    csv += `Total, , , ${totalSum}\n`;
    csv += `Positive, , , ${positiveSum}\n`;
    csv += `Negative, , , ${negativeSum}\n`;
    
    return csv;
}

function downloadCSV(csv) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.csv";
    a.click();
    URL.revokeObjectURL(url);
}

function CSVtoTable(csv) {
    let table = document.getElementById("expenseTable");
    table.innerHTML = "";
    let rows = csv.split("\n");
    //Add th
    let th = document.createElement("tr");
    let headers = rows[0].split(",");
    for (let i = 0; i < headers.length; i++) {
        let td = document.createElement("th");
        td.textContent = headers[i];
        th.appendChild(td);
    }
    table.appendChild(th);
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i].split(",");
        let tr = document.createElement("tr");
        for (let j = 0; j < row.length; j++) {
            let td = document.createElement("td");
            td.textContent = row[j];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
}

function reloadCategoryButtons() {
    let buttonsArea = document.getElementById("categoryButtonsArea");
    console.log(categories);
    buttonsArea.innerHTML = "";
    //first button to skip
    let button = document.createElement("button");
    button.textContent = "Skip";
    button.innerHTML = "Skip";
    button.classList.add("categoryButton");
    button.id = `categoryButtonSkip`;
    button.value = "Skip";
    button.setAttribute("data-category", "Skip");
    button.onclick = function() {
        nextExpense();
    }
    buttonsArea.appendChild(button);
    for (let i = 0; i < categories.length; i++) {
        let button = document.createElement("button");
        button.textContent = categories[i];
        button.innerHTML = categories[i];
        button.classList.add("categoryButton");
        button.id = `categoryButton${categories[i]}`;
        button.value = categories[i];
        button.setAttribute("data-category", categories[i]);
        button.onclick = function() {
            categoryButtonClicked(button.value);
        }
        buttonsArea.appendChild(button);
    }
    
}

function categoryButtonClicked(buttonValue) {
    pastClassifications[currentData[1]] = buttonValue;
    addToOutputData(buttonValue);
    console.log("outputData:", outputData);
    nextExpense();
}

function removeNaNFromData() {
    for (element in outputData) {
        let cur = outputData[element]
        for (let i = 0; i < cur.length; i++) {

            if (isNaN(parseFloat(cur[i][0]))) {
                cur[i][0] = "0";
            }
        }
    }
}

function addToOutputData(category) {
    if (isNaN(parseFloat(currentData[0]))) {
        currentData[0] = "0";
    }
    if (outputData[category]) {
        outputData[category].push(currentData);
    } else {
        outputData[category] = [currentData];
    }
}

function nextExpense() {
    if (currentRow >= rows.length) {
        console.log("All expenses categorized");
        console.log(outputData);
        document.getElementById("cost").textContent = "All expenses categorized!";
        document.getElementById("description").textContent = "Submit another file to keep going";
        return;
    }
    const row = rows[currentRow];
    console.log(row);
    console.log(row[costCol]);
    console.log(row[descriptionCol]);

    try {
        const cost = row[costCol].replace(/['"]/g, '');
        const description = row[descriptionCol].replace(/['"]/g, '');

        document.getElementById("cost").textContent = cost;
        document.getElementById("description").textContent = description;
        currentData = [cost, description];

        if (pastClassifications[description]) {
            console.log("Skipping", description);
            addToOutputData(pastClassifications[description]);
            currentRow++;
            nextExpense();
            return;
        }

        currentRow++;

        CSVtoTable(outputToCSV());

    } catch (e) {

        console.log("Error parsing row", row);
        console.log(e);
        currentRow++;
        nextExpense();
    }


}


function categorizeExpenses() {
    cols = rows[0].map((header, index) => `(${index}): ${header}`);
    costCol = prompt(`Which column contains the cost? (0-indexed) \n${cols}`);
    descriptionCol = prompt(`Which column contains the description? (0-indexed) \n${cols}`);
   
    console.log(costCol, descriptionCol);

    expenseGame = document.getElementById("expenseGame")

    currentRow = 0;

    nextExpense();   
}
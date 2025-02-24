<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Aleatoria</title>
    <style>
        body {
            display: flex;
            flex-direction: row;
            height: 100vh;
            margin: 0;
            background-color: #222;
            color: white;
            font-family: Arial, sans-serif;
        }
        #urlListsContainer {
            display: flex;
            flex-direction: column;
            width: 25vw;
            max-height: 100vh;
            overflow-y: auto;
            background: #333;
            padding: 10px;
            border-radius: 5px;
        }
        #urlList, #respondedList {
            flex-grow: 1;
            max-height: 40vh;
            overflow-y: auto;
            padding: 5px;
        }
        #counters {
            margin-bottom: 10px;
        }
        #content {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            width: 75vw;
            padding: 20px;
        }
        #buttonsContainer {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        #urlDisplay {
            margin: 10px;
            font-size: 18px;
            font-weight: bold;
        }
        iframe {
            width: 70vw;
            height: 80vh;
            border: none;
        }
        .url-item {
            padding: 5px;
            color: white;
        }
        .responds {
            color: green;
        }
        .no-responds {
            color: red;
        }
        #reloadButton, #autoGenerateButton {
            padding: 10px;
            background-color: #444;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        #reloadButton:hover, #autoGenerateButton:hover {
            background-color: #666;
        }
    </style>
    <script>
        let generatedUrls = new Set();
        let autoGenerating = false;
        let autoGenerateInterval;
        let totalUrls = 0;
        let urlsResponded = 0;
        let urlsNotResponded = 0;

        function updateCounters() {
            document.getElementById("totalCount").textContent = totalUrls;
            document.getElementById("respondedCount").textContent = urlsResponded;
            document.getElementById("notRespondedCount").textContent = urlsNotResponded;
        }

        function generateRandomString(length) {
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        function generateRandomExtension() {
            const extensions = ["com", "net", "org", "info", "xyz", "io", "biz", "online"];
            return extensions[Math.floor(Math.random() * extensions.length)];
        }

        function checkUrl(url) {
            fetch(url, { mode: 'no-cors' })
                .then(() => updateUrlList(url, true))
                .catch(() => updateUrlList(url, false));
        }

        function updateUrlList(url, responds) {
            totalUrls++;
            if (responds) urlsResponded++;
            else urlsNotResponded++;
            updateCounters();
            
            const urlList = document.getElementById("urlList");
            const respondedList = document.getElementById("respondedList");
            const listItem = document.createElement("div");
            listItem.textContent = url + (responds ? " (responde)" : " (no responde)");
            listItem.classList.add("url-item", responds ? "responds" : "no-responds");
            urlList.appendChild(listItem);
            urlList.scrollTop = urlList.scrollHeight;
            saveToFile(url, responds, "urlslist.txt");
            if (responds) {
                const respondedItem = document.createElement("div");
                respondedItem.textContent = url;
                respondedItem.classList.add("url-item", "responds");
                respondedList.appendChild(respondedItem);
                respondedList.scrollTop = respondedList.scrollHeight;
                saveToFile(url, responds, "urls_responded.txt");
            }
        }

        function saveToFile(url, responds, fileName) {
            const data = url + (responds ? " (responde)\n" : " (no responde)\n");
            fetch("save_url.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "fileName=" + encodeURIComponent(fileName) + "&url=" + encodeURIComponent(data)
            });
        }

        function generateNewUrl() {
            let randomDomain;
            do {
                randomDomain = generateRandomString(Math.floor(Math.random() * 10) + 5) + "." + generateRandomExtension();
            } while (generatedUrls.has(randomDomain));

            generatedUrls.add(randomDomain);
            const randomUrl = "https://" + randomDomain;
            document.getElementById("randomFrame").src = randomUrl;
            document.getElementById("urlDisplay").textContent = "Mostrando: " + randomUrl;
            checkUrl(randomUrl);
        }

        function toggleAutoGenerate() {
            autoGenerating = !autoGenerating;
            if (autoGenerating) {
                autoGenerateInterval = setInterval(generateNewUrl, 500);
                document.getElementById("autoGenerateButton").textContent = "Detener Auto Generación";
            } else {
                clearInterval(autoGenerateInterval);
                document.getElementById("autoGenerateButton").textContent = "Iniciar Auto Generación";
            }
        }

        document.addEventListener("DOMContentLoaded", generateNewUrl);
    </script>
</head>
<body>
    <div id="urlListsContainer">
        <div id="counters">
            <strong>Total URLs Generadas: <span id="totalCount">0</span></strong><br>
            <strong>URLs sin Respuesta: <span id="notRespondedCount">0</span></strong><br>
            <strong>URLs con Respuesta: <span id="respondedCount">0</span></strong>
        </div>
        <div id="urlList"><strong>URLs Generadas:</strong></div>
        <div id="respondedList"><strong>URLs que Respondieron:</strong></div>
    </div>
    <div id="content">
        <button id="reloadButton" onclick="generateNewUrl()">Generar Nueva URL</button>
        <button id="autoGenerateButton" onclick="toggleAutoGenerate()">Iniciar Auto Generación</button>
        <div id="urlDisplay">Cargando...</div>
        <iframe id="randomFrame"></iframe>
    </div>
</body>
</html>

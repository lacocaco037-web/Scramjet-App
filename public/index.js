"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
	}
	const frame = scramjet.createFrame();
	frame.frame.id = "sj-frame";
	document.body.appendChild(frame.frame);
	frame.go(url);
});

(function () {
  const p = new URLSearchParams(location.search);
  if (!p.get("q")) return;
  const ENG = {
    bing: "https://www.bing.com/search?q=%s",
    ddg: "https://duckduckgo.com/?q=%s",
    brave: "https://search.brave.com/search?q=%s",
    google: "https://www.google.com/search?q=%s",
    mojeek: "https://www.mojeek.com/search?q=%s",
    startpage: "https://www.startpage.com/sp/search?query=%s",
    yahoo: "https://search.yahoo.com/search?p=%s",
    ecosia: "https://www.ecosia.org/search?q=%s",
    qwant: "https://www.qwant.com/?q=%s"
  };
  if (p.get("e") && ENG[p.get("e")]) searchEngine.value = ENG[p.get("e")];
  address.value = p.get("q");
  form.requestSubmit();
})();

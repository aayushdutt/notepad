require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  let editor = monaco.editor.create(document.getElementById("editor"), {
    value: [""].join("\n"),
    language: "markdown",
    minimap: {
      enabled: true,
      renderCharacters: false,
    },
    fontSize: 18,
    automaticLayout: true,
  });

  let textModified = false; // flag to track whether the text has been modified
  editor.addAction({
    id: "my-unique-id",
    label: "My Label!!!",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    precondition: null,
    keybindingContext: null,
    run: function (e) {
      let tx = db.transaction("text", "readwrite");
      let store = tx.objectStore("text");
      let text = editor.getValue();
      store.put({ id: "saved-text", text: text });
      document.title = document.title.replace(/^\* /, "");
      textModified = false;
    },
  });

  let firstChange = true;
  // Add a star to the window title when the text is changed
  editor.onDidChangeModelContent(function () {
    if (!textModified && !firstChange) {
      document.title = "* " + document.title;
      textModified = true;
    }
  });

  let db;
  let request = indexedDB.open("monaco-editor-demo", 1);
  request.onupgradeneeded = function () {
    db = request.result;
    db.createObjectStore("text", { keyPath: "id" });
  };

  request.onsuccess = function () {
    db = request.result;

    // Load the saved text from IndexedDB
    let tx = db.transaction("text");
    let store = tx.objectStore("text");
    let getRequest = store.get("saved-text");

    getRequest.onsuccess = function () {
      if (getRequest.result) {
        editor.setValue(getRequest.result.text);
        firstChange = false;
      }
    };

    // Save the text to IndexedDB when the user presses Ctrl+S
    // Save the text to IndexedDB when the user presses Ctrl+S
  };
});

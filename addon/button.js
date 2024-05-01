/* exported initButton */
/* global showStdPageDetails */
"use strict";

// sfdcBody = normal Salesforce page
// ApexCSIPage = Developer Console
// auraLoadingBox = Lightning / Salesforce1
if (document.querySelector("body.sfdcBody, body.ApexCSIPage, #auraLoadingBox") || location.host.endsWith("visualforce.com")) {
  // We are in a Salesforce org
  chrome.runtime.sendMessage({message: "getSfHost", url: location.href}, sfHost => {
    if (sfHost) {
      initButton(sfHost, false);
    }
  });
}

function initButton(sfHost, inInspector) {
  let rootEl = document.createElement("div");
  rootEl.id = "insext";
  let btn = document.createElement("div");
  let iFrameLocalStorage = {};
  btn.className = "insext-btn";
  btn.tabIndex = 0;
  btn.accessKey = "i";
  btn.title = "Show Salesforce details (Alt+I / Shift+Alt+I)";
  rootEl.appendChild(btn);
  loadPopup();
  document.body.appendChild(rootEl);
  addFlowScrollability();

  function addFlowScrollability(popupEl) {
    const currentUrl = window.location.href;
    // Check the current URL for the string "builder_platform_interaction"
    if (currentUrl.includes("builder_platform_interaction")) {
      // Create a new checkbox element
      const headerFlow = document.querySelector("builder_platform_interaction-container-common");
      const overflowCheckbox = document.createElement("input");
      overflowCheckbox.type = "checkbox";
      overflowCheckbox.id = "overflow-checkbox";
      const checkboxState = iFrameLocalStorage.scrollOnFlowBuilder;
      // Check local storage for the checkbox state
      (checkboxState != null) ? (overflowCheckbox.checked = checkboxState) : (overflowCheckbox.checked = true);
      // Create a new label element for the checkbox
      const overflowLabel = document.createElement("label");
      overflowLabel.textContent = "Enable flow scrollability";
      overflowLabel.htmlFor = "overflow-checkbox";
      if (currentUrl.includes("sandbox")){
        overflowCheckbox.className = "checkboxScrollSandbox";
        overflowLabel.className = "labelCheckboxScrollSandbox";
      } else {
        overflowCheckbox.className = "checkboxScrollProd";
        overflowLabel.className = "labeCheckboxScrollProd";
      }
      // Get a reference to the <head> element
      const head = document.head;
      // Create a new <style> element
      const style = document.createElement("style");
      // Set the initial text content of the <style> element
      style.textContent = ".canvas {overflow : auto!important ; }";
      // Append the <style> element to the <head> element
      head.appendChild(style);
      // Append the checkbox and label elements to the body of the document
      headerFlow.appendChild(overflowCheckbox);
      headerFlow.appendChild(overflowLabel);
      // Set the overflow property to "auto"
      overflowCheckbox.checked ? style.textContent = ".canvas {overflow : auto!important ; }" : style.textContent = ".canvas {overflow : hidden!important ; }";
      // Listen for changes to the checkbox state
      overflowCheckbox.addEventListener("change", function() {
        // Check if the checkbox is currently checked
        // Save the checkbox state to local storage
        popupEl.contentWindow.postMessage({
          updateLocalStorage: true,
          key: "scrollOnFlowBuilder",
          value: JSON.stringify(this.checked)
        }, "*");
        // Set the overflow property to "auto"
        this.checked ? style.textContent = ".canvas {overflow : auto!important ; }" : style.textContent = ".canvas {overflow : hidden!important ; }";
      });
    }
  }

  function setPopupStyles(el, stylesToAdd) {
    const styleMap = new Map(stylesToAdd);
    const styleTypes = ["top", "right", "bottom"];
    for (let s of styleTypes) {
      // Set the style to the value in the map or explicitly make it empty
      el.style[s] = styleMap.has(s) ? styleMap.get(s) : "";
    }
  }

  function setPopupClasses(el, classesToAdd) {
    const allClasses = ["horizontal", "horizontal-left", "horizontal-centered", "horizontal-right", "vertical", "vertical-up"];
    return setClasses(el, classesToAdd, allClasses, "popup");
  }

  function setButtonClasses(el, classesToAdd) {
    const allClasses = ["vertical", "horizontal"];
    return setClasses(el, classesToAdd, allClasses, "btn");
  }

  function setClasses(el, classesToAdd, allClasses, prefix) {
    // Helper to clean up popup classes and add new ones
    for (let c of allClasses) {
      if (classesToAdd?.includes(c)) {
        el.classList.add(`insext-${prefix}-${c}`);
      } else if (el.classList.contains(`insext-popup-${c}`)) {
        el.classList.remove(`insext-${prefix}-${c}`);
      }
    }
  }

  function getOrientation(value) {
    return value ? value : "vertical";
  }

  function getPosition(isVertical, value) {
    // Enforce safe boundaries for the popup arrow position
    // Horizontal is 0% left to 100% right, vertical is 0% top to 100% bottom, default 20%
    if (!(value > 3 && value < 97)) {
      value = 20;
    }
    return (isVertical ? value : 100 - value) + '%';
  }

  function setRootCSSProperties(rootElement, buttonElement) {
    // detect if the button is already drawn so we can update orientation properly
    let rerender = false;
    let img = buttonElement.querySelector("img[id='insext-btn-img-popup']");
    if (img?.src) {
      console.log('will rerender');
      rerender = true;
    } else {
      img = document.createElement("img");
      img.id = "insext-btn-img-popup";
      buttonElement.appendChild(img);
    }

    // Determine popup orientation (horizontal/vertical) and position (as % of screen)
    let popupArrowOrientation = getOrientation(iFrameLocalStorage.popupArrowOrientation);
    let isVertical = popupArrowOrientation == "vertical";
    const  popupArrowPosition = getPosition(isVertical, iFrameLocalStorage.popupArrowPosition);

    if (isVertical) {
      img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd/14OAAAA40lEQVQoz2P4//8/AzpWzGj6L59U/V8urgxMg/g4FUn6J/+X9E38LxWc8V8htR67IpCkuGfMfxCQjSpENRFFkXvk/1+/foGxQloDSD0DVkVfvnyBY7hCdEVv3rxBwXCFIIdKh2WDFT1+/BgDo1qd2fL/1q1bWDFcoW5xz3/Xppn/oycu/X/x4kUMDFeoWdD136R8wn+f9rlgxSdOnEDBKFajK96/fz8coyjEpnj79u1gjKEQXXFE/+L/Gzdu/G9WMfG/am4HZlzDFAf3LPwfOWEJWBPIwwzYUg9MsXXNFDAN4gMAmASShdkS4AcAAAAASUVORK5CYII=";
      //rootElement.style.right = 0;
      //rootElement.style.top = popupArrowPosition;
      setPopupStyles(rootElement, [["top", popupArrowPosition], ["right", 0]]);
      setButtonClasses(buttonElement, ["vertical"]);
      // buttonElement.classList.add("insext-btn-vertical");
      // if (rerender) {
      //   buttonElement.classList.remove("insext-btn-horizontal");
      //   rootElement.style.removeProperty("bottom");
      // }
    } else {
      img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKCAYAAABrGwT5AAAAAXNSR0IArs4c6QAAAFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAD6ADAAQAAAABAAAACgAAAADdC3pnAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAABKElEQVQoFWNgwAI0C7r+6xb3/AdJKaTW/1fMaAKz0ZUyoguANHKzszEIcnMy3Hn+muHX2+cMLDwCDExs7Az3Z9ShqGdC1gzTKCHAyyDGz8OwszCM4c/Hdwy/P75l+PfrJwO6C+CakTXyc3EwlDnogM09M6eL4e+Xj1gNAGtG15hrrozsIIarSydjNYARXWOKnhQDJycnBubg4GBQDk5lYObhZ2DlFwaHARMocORFBRl4ONgYYtSEUGxE5zzevJDh77cvwEB8AQ4DJnZWFgY2FmaGSCU+dLVY+S+2LWZg+PeP4f+f3wwsP3//Yfj8/SdD6/G3DK/evceqAVkQFHiMwGhjZGFlYPn68xfDwzfvGX78+sPwYFYDSjwia4KxQdHF/JePgZGZmQEASqV1t0W3n+oAAAAASUVORK5CYII=";
      setPopupStyles(rootElement, [["bottom", 0], ["right", popupArrowPosition]]);
      setButtonClasses(buttonElement, ["horizontal"]);
      // rootElement.style.bottom = 0;
      // rootElement.style.right = popupArrowPosition;
      // buttonElement.classList.add("insext-btn-horizontal");
      // if (rerender) {
      //   buttonElement.classList.remove("insext-btn-vertical");
      //   rootElement.style.removeProperty("top");
      // }
    }
    console.log('switch', rootElement.style.cssText, rerender, buttonElement.style.cssText, buttonElement.classList);
  }

  // Tilt to show that it's moveable
  function tilt(el, degrees) {
    el.style.transform = `rotate(${degrees}deg)`;
    el.style.mozTransform = `rotate(${degrees}deg)`;
    el.style.webkitTransform = `rotate(${degrees}deg)`;
    el.style.msTransform = `rotate(${degrees}deg)`;
  }

  function switchOrientation() {
    iFrameLocalStorage.popupArrowOrientation = iFrameLocalStorage.popupArrowOrientation == "horizontal" ? "vertical" : "horizontal";
    setRootCSSProperties(rootEl, btn);
  }

  // Switch H/V orientation based on mouse positionD
  function calcOrientation(e) {
    let isVertical = localStorage.getItem("popupArrowOrientation") == "vertical";
    const {innerWidth, innerHeight} = window;
    const [x, y] = [e.clientX / innerWidth, e.clientY / innerHeight];
    if (!isVertical && y > .95 && x <= .98) {
      switchOrientation();
    } else if (isVertical && x > .95 && y <= .98) {
      switchOrientation();
    }
  }

  let isDragging = false;
  let offset = 0;
  let sliderTimeout = null;
  let posTimeout = null;

  function setFavicon(sfHost){
    let fav = iFrameLocalStorage[sfHost + "_customFavicon"];
    if (iFrameLocalStorage.useCustomFavicon && fav){
      let link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.orgType = "image/x-icon";
      if (fav.indexOf("http") == -1){
        fav = chrome.runtime.getURL("images/favicons/" + fav + ".png");
      }
      link.href = fav;
      document.head.appendChild(link);
    }
  }

  function canDrag() {
    return localStorage.getItem("allowPopupDrag") === "true";
  }

  function loadPopup() {
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (!canDrag()) {
        return;
      }

      // allow button drag after brief hold
      sliderTimeout = setTimeout(() => {
        isDragging = true;
        const rect = rootEl.getBoundingClientRect();
        offset = rect.top - e.clientY;
        tilt(btn, -5);
      }, 200);
    });

    // track in window to prevent button from getting stuck
    window.addEventListener("mouseup", (e) => {
      if (!canDrag() || !isDragging) {
        return;
      }
      isDragging = false;
      e.preventDefault();
      clearTimeout(sliderTimeout);

      // TODO: Where is the switch to vertical?
      console.log("xy", e.clientX, e.clientY);
      console.log("w", window.innerWidth, window.innerHeight);
      // console.log("o", calcOrientation(e));
      // add delay to prevent click event from firing, otherwise it's a click
      sliderTimeout = setTimeout(() => {
        isDragging = false;
        tilt(btn, 0);
        parent.postMessage({
          insextInitRequest: true,
          iFrameLocalStorage: {
            popupArrowOrientation: localStorage.getItem("popupArrowOrientation"),
            popupArrowPosition: JSON.parse(localStorage.getItem("popupArrowPosition")),
            scrollOnFlowBuilder: JSON.parse(localStorage.getItem("scrollOnFlowBuilder"))
          }
        }, "*");
      }, 100);
    });

    // track movement to recalculate button position
    window.addEventListener("mousemove", (e) => {
      if (!canDrag() || e.buttons !== 1) {
        tilt(btn, 0);
        clearTimeout(sliderTimeout);
        return;
      }
      e.preventDefault();
      if (!isDragging) {
        tilt(btn, 0);
        clearTimeout(sliderTimeout);
        return;
      }
      // move in realtime and debounce storing of the position
      rootEl.style.top = (e.clientY + offset) + "px";
      clearTimeout(posTimeout);
      posTimeout = setTimeout(() => {
        // calc location as percent between 0 and 95
        let buttonY = Math.round((e.clientY + offset) / window.innerHeight * 100);
        let buttonX = Math.round((e.clientX) / window.innerWidth * 100);
        let buttonPos = iFrameLocalStorage.popupArrowOrientation == "horizontal" ? buttonX : buttonY;
        buttonY = Math.min(95, Math.max(0, buttonY));
        popupEl.contentWindow.postMessage({
          updateLocalStorage: true,
          key: "popupArrowPosition",
          value: JSON.stringify(buttonPos)
        }, "*");
      }, 50);
    });

    btn.addEventListener("click", (e) => {
      if (isDragging) {
        return;
      }
      const popAction = rootEl.classList.contains("insext-active") ? closePopup : openPopup;
      popAction();
      isDragging = false;
      tilt(btn, 0);
    });

    let popupSrc = chrome.runtime.getURL("popup.html");
    let popupEl = document.createElement("iframe");
    // default to vertical
    let isVertical = localStorage.getItem("popupArrowOrientation") !== "horizontal";
    popupEl.className = "insext-popup";
    const classesToAdd = isVertical ? ["vertical"] : ["horizontal"];
    setPopupClasses(popupEl, classesToAdd);
    popupEl.src = popupSrc;
    addEventListener("message", e => {
      // Only accept messages from the popup iframe and refresh the location of the button and relative popup position
      if (e.source !== popupEl.contentWindow && e.source !== window) {
        return;
      }
      if (e.data.insextInitRequest) {
        // Set CSS classes for arrow button position
        const insextClasses = [];
        iFrameLocalStorage = e.data.iFrameLocalStorage;
        if (iFrameLocalStorage.popupArrowOrientation == "horizontal") {
          insextClasses.push("horizontal");
          if (iFrameLocalStorage.popupArrowPosition < 8) {
            insextClasses.push("horizontal-right");
          } else if (iFrameLocalStorage.popupArrowPosition >= 90) {
            insextClasses.push("horizontal-left");
          } else {
            insextClasses.push("horizontal-centered");
          }
        } else {
          // Vertical or hasn't been set yet (default)
          insextClasses.push("vertical");
          if (iFrameLocalStorage.popupArrowPosition >= 55) {
            insextClasses.push("vertical-up");
          }
        }
        setPopupClasses(popupEl, insextClasses);
        setRootCSSProperties(rootEl, btn);
        addFlowScrollability(popupEl);
        setFavicon(sfHost);
        popupEl.contentWindow.postMessage({
          insextInitResponse: true,
          sfHost,
          inDevConsole: !!document.querySelector("body.ApexCSIPage"),
          inLightning: !!document.querySelector("#auraLoadingBox"),
          inInspector,
        }, "*");
      }
      if (e.data.insextClosePopup) {
        closePopup();
      }"field-api-name";
      if (e.data.insextShowStdPageDetails) {
        showStdPageDetails(e.data.insextData, e.data.insextAllFieldSetupLinks);
      }
      if (e.data.insextShowApiName) {
        let apiNamesClass = "field-api-name";
        if (e.data.btnLabel.startsWith("Show")){
          document.querySelectorAll("record_flexipage-record-field > div, records-record-layout-item > div, div .forcePageBlockItemView").forEach(field => {
            let label = field.querySelector("span");
            if (field.dataset.targetSelectionName && label.querySelector("mark") == null){
              label.innerText = label.innerText + " ";
              const fieldApiName = document.createElement("mark");
              fieldApiName.className = apiNamesClass;
              fieldApiName.style.cursor = "copy";
              fieldApiName.innerText = field.dataset.targetSelectionName.split(".")[2];
              label.appendChild(fieldApiName);
              label.addEventListener("click", copy);
            }
          });
        } else {
          document.querySelectorAll("." + apiNamesClass).forEach(e => e.remove());
        }
      }
    });
    rootEl.appendChild(popupEl);
    // Function to handle copy action
    function copy(e) {
      // Retrieve the text content of the target element triggered by the event
      const originalText = e.target.innerText; // Save the original text
      // Attempt to copy the text to the clipboard
      navigator.clipboard.writeText(originalText).then(() => {
        // Create a new span element to show the copy success indicator
        const copiedIndicator = document.createElement("span");
        copiedIndicator.textContent = "Copied ✓"; // Set the text content to indicate success
        copiedIndicator.className = "copiedText"; // Assign a class for styling purposes

        // Add the newly created span right after the clicked element in the DOM
        if (e.target.nextSibling) {
          // If the target has a sibling, insert the indicator before the sibling
          e.target.parentNode.insertBefore(copiedIndicator, e.target.nextSibling);
        } else {
          // If no sibling, append the indicator as the last child of the parent
          e.target.parentNode.appendChild(copiedIndicator);
        }

        // Remove the indicator span after 2 seconds
        setTimeout(() => {
          if (copiedIndicator.parentNode) {
            // Ensure the element still has a parent before removing
            copiedIndicator.parentNode.removeChild(copiedIndicator);
          }
        }, 2000); // Set timeout for 2 seconds
      }).catch(err => {
        // Log an error message if the copy action fails
        console.error("Copy failed: ", err);
      });
    }
    function openPopup() {
      let activeContentElem = document.querySelector("div.windowViewMode-normal.active, section.oneConsoleTab div.windowViewMode-maximized.active.lafPageHost");
      let isFieldsPresent = activeContentElem ? !!activeContentElem.querySelector("record_flexipage-record-field > div, records-record-layout-item > div, div .forcePageBlockItemView") : false;
      popupEl.contentWindow.postMessage({insextUpdateRecordId: true,
        locationHref: location.href,
        isFieldsPresent
      }, "*");
      rootEl.classList.add("insext-active");
      // These event listeners are only enabled when the popup is active to avoid interfering with Salesforce when not using the inspector
      addEventListener("click", outsidePopupClick);
      popupEl.focus();
    }
    function closePopup() {
      rootEl.classList.remove("insext-active");
      removeEventListener("click", outsidePopupClick);
      popupEl.blur();
    }
    function outsidePopupClick(e) {
      // Close the popup when clicking outside it
      if (!rootEl.contains(e.target)) {
        closePopup();
      }
    }
  }
}

class HouseholdBuilderPage {
  static AGE_INPUT_ID = "age";
  static RELATIONSHIP_INPUT_ID = "rel";
  static SMOKING_INPUT_ID = "smoker";
  static MEMBER_ID_INPUT_ID = "id";
  static DELIMITER = "-";

  constructor() {
    this._addIdentifier();
    this._locateElements();
    this._copyElements();
    this._setValidation();
    this._parseQueryIntoInputs();
    this._setSubmissionListener();
  }

  _addIdentifier() {
    const $memberIdInput = document.createElement("input");
    $memberIdInput.setAttribute("type", "number");
    $memberIdInput.setAttribute("hidden", "true");
    $memberIdInput.setAttribute("id", HouseholdBuilderPage.MEMBER_ID_INPUT_ID);
    $memberIdInput.setAttribute(
      "name",
      HouseholdBuilderPage.MEMBER_ID_INPUT_ID
    );
    $memberIdInput.value = Date.now();
    document.getElementsByTagName("form")[0].append($memberIdInput);
  }

  _locateElements() {
    // Grab Inputs
    this.ageInput = document.getElementById(HouseholdBuilderPage.AGE_INPUT_ID);
    this.relationshipInput = document.getElementById(
      HouseholdBuilderPage.RELATIONSHIP_INPUT_ID
    );
    this.smokingInput = document.getElementById(
      HouseholdBuilderPage.SMOKING_INPUT_ID
    );
    this.memberIdInput = document.getElementById(
      HouseholdBuilderPage.MEMBER_ID_INPUT_ID
    );
    this.householdList = document.getElementsByClassName("household")[0];
    this.debugOutput = document.getElementsByClassName("debug")[0];
  }

  _copyElements() {
    const $age = this.ageInput.cloneNode(true);
    $age.removeAttribute("id");
    this.ageInputBase = $age;

    const $relationship = this.relationshipInput.cloneNode(true);
    $relationship.removeAttribute("id");
    this.relationshipInputBase = $relationship;

    const $smoking = this.smokingInput.cloneNode(true);
    $smoking.removeAttribute("id");
    this.smokingInputBase = $smoking;

    const $memberId = this.memberIdInput.cloneNode(true);
    $memberId.removeAttribute("id");
    this.memberIdInputBase = $smoking;
  }

  _setValidation() {
    // Add validations
    // Age
    this.ageInput.setAttribute("type", "number");
    this.ageInput.setAttribute("required", "true");
    this.ageInput.setAttribute("min", "1");
    this.ageInput.setAttribute("step", "1");
    document.querySelector(
      `[for="${HouseholdBuilderPage.AGE_INPUT_ID}"]`
    ).firstChild.textContent += " (required)";
    // Relationship
    this.relationshipInput.setAttribute("required", "true");
    document.querySelector(
      `[for="${HouseholdBuilderPage.RELATIONSHIP_INPUT_ID}"]`
    ).firstChild.textContent += " (required)";
  }

  _parseQueryIntoInputs() {
    if (window.location.search) {
      const query = parseSearchString(window.location.search);
      const newMemberAge = query[HouseholdBuilderPage.AGE_INPUT_ID];
      delete query[HouseholdBuilderPage.AGE_INPUT_ID];
      const newMemberRelationship =
        query[HouseholdBuilderPage.RELATIONSHIP_INPUT_ID];
      delete query[HouseholdBuilderPage.RELATIONSHIP_INPUT_ID];
      const newMemberSmoking =
        query[HouseholdBuilderPage.SMOKING_INPUT_ID] || false;
      delete query[HouseholdBuilderPage.SMOKING_INPUT_ID];
      const newMemberMemberId = query[HouseholdBuilderPage.MEMBER_ID_INPUT_ID];
      delete query[HouseholdBuilderPage.MEMBER_ID_INPUT_ID];

      let members = {
        [newMemberMemberId]: {
          [HouseholdBuilderPage.AGE_INPUT_ID]: newMemberAge,
          [HouseholdBuilderPage.RELATIONSHIP_INPUT_ID]: newMemberRelationship,
          [HouseholdBuilderPage.SMOKING_INPUT_ID]: newMemberSmoking,
          [HouseholdBuilderPage.MEMBER_ID_INPUT_ID]: newMemberMemberId,
        },
      };

      Object.keys(query).reduce((sum, inputName) => {
        const nameIdTuple = inputName.split(HouseholdBuilderPage.DELIMITER);
        const name = nameIdTuple[0];
        const memberId = nameIdTuple[1];
        if (!sum[memberId]) {
          sum[memberId] = {};
        }
        sum[memberId][name] = query[inputName];
        return sum;
      }, members);

      Object.keys(members)
        .reverse()
        .forEach((memberId) => {
          const values = members[memberId];
          const age = values[HouseholdBuilderPage.AGE_INPUT_ID];
          const relationship =
            values[HouseholdBuilderPage.RELATIONSHIP_INPUT_ID];
          const smoking = values[HouseholdBuilderPage.SMOKING_INPUT_ID];

          // Add to list
          const $li = document.createElement("li");
          $li.setAttribute("id", memberId);
          $li.textContent = `Member age: ${age}, relationship: ${relationship}, smoker: ${
            smoking ? "Yes" : "No"
          }`;
          const $removeBtn = document.createElement("button");
          $removeBtn.setAttribute("type", "button");
          $removeBtn.textContent = "Remove member";
          $removeBtn.addEventListener("click", (event) => {
            document.querySelector(`fieldset[name="${memberId}"]`).remove();
            document.getElementById(memberId).remove();
          });
          $li.appendChild($removeBtn);
          this.householdList.appendChild($li);
          // Add to form
          const $form = document.getElementsByTagName("form")[0];
          const $fieldset = document.createElement("fieldset");
          $fieldset.setAttribute("name", memberId);
          $fieldset.setAttribute("hidden", "true");
          const $age = this.ageInputBase.cloneNode(true);
          $age.setAttribute(
            "name",
            $age.getAttribute("name") +
              HouseholdBuilderPage.DELIMITER +
              memberId
          );
          $age.value = age;
          $fieldset.append($age);
          const $relationship = this.relationshipInputBase.cloneNode(true);
          $relationship.setAttribute(
            "name",
            $relationship.getAttribute("name") +
              HouseholdBuilderPage.DELIMITER +
              memberId
          );
          $relationship.value = relationship;
          $fieldset.append($relationship);
          const $smoking = this.smokingInputBase.cloneNode(true);
          $smoking.setAttribute(
            "name",
            $smoking.getAttribute("name") +
              HouseholdBuilderPage.DELIMITER +
              memberId
          );
          $smoking.checked = !!smoking;
          $fieldset.append($smoking);
          $form.append($fieldset);
        });
    }
  }

  _setSubmissionListener() {
    document
      .querySelector(`button[type="submit"]`)
      .addEventListener("click", (event) => {
        event.preventDefault();
        const formData = new FormData(document.querySelector("form"));
        const data = {};
        for (var pair of formData.entries()) {
          const key = pair[0];
          const keyTuple = key.split(HouseholdBuilderPage.DELIMITER);
          const inputName = keyTuple[0];
          const memberId = keyTuple[1];
          const memberID = keyTuple[1];
          const value = pair[1];
          if (!memberId) {
            continue;
          }
          if (!data[memberId]) {
            data[memberId] = {};
          }
          data[memberId][inputName] = value;
        }
        this.debugOutput.style.display = "block";
        this.debugOutput.textContent = JSON.stringify(data, null, 4);
      });
  }
}

new HouseholdBuilderPage();

// Mostly copied of stackoverflow
function parseSearchString(queryString) {
  var query = {};
  var pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1] || "");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

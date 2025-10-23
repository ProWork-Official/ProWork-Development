// Open and Close Personal Form
export function togglePersonalForm(isOpen) {
    const personalDetailsForm = document.getElementById('PersonalDetailsForm');

    if (personalDetailsForm) {
        personalDetailsForm.classList.toggle('displayFlex', isOpen);
        personalDetailsForm.classList.toggle('displayNone', !isOpen);
    } else {
        console.error("Element with ID 'PersonalDetailsForm' not found.");
    }
}
// Open and Close Personal Details
    export function togglePersonalLabel(isOpen) {
        const personalDetailsLabel = document.getElementById('PersonalDetailsLabel');

        if (personalDetailsLabel) {
            personalDetailsLabel.classList.toggle('displayFlex', isOpen);
            personalDetailsLabel.classList.toggle('displayNone', !isOpen);
        } else {
            console.error("Element with ID 'PersonalDetailsLabel' not found.");
        }
    }
// close personal edit form
export function togglePersonalEdit(){
    const EditPersonalDetailsForm = document.getElementById('EditPersonalDetailsForm')
    EditPersonalDetailsForm.classList.add('displayNone')
    EditPersonalDetailsForm.classList.remove('displayFlex')
}
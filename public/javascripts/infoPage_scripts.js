const multiStepForm = document.querySelector("[data-multi-step]")
const formSteps = [...multiStepForm.querySelectorAll("[data-step]")]
const bullet = document.querySelectorAll(".step .bullet");
const progressText = document.querySelectorAll(".step p");


//findIndex->returns the index of the first element in an array that satisfies the provided testing function.
//classList.contains->用來檢查是否存在某 class，回傳 boolean 值。
let currentStep = formSteps.findIndex(step => {
    return step.classList.contains("active")
})

if(currentStep < 0){
    currentStep = 0
    showCurrentStep()
}

multiStepForm.addEventListener("click", e => {
    let incrementor
    if(e.target.matches("[data-next]")){
        incrementor = 1
    }
    else if(e.target.matches("[data-previous]")){
        incrementor = -1
    }

    if(incrementor==null){
        return
    }

    const inputs = [...formSteps[currentStep].querySelectorAll("input")]
    //some->如果有任一元素通過測試返回 true；反之則返回 false
    const isValid = inputs.every(input => input.reportValidity())
    if(isValid){
        if(incrementor==1){
            bullet[currentStep].classList.add("active");
            progressText[currentStep].classList.add("active");
        }
        else if(incrementor==-1){
            bullet[currentStep-1].classList.remove("active");
            progressText[currentStep-1].classList.remove("active");
        }
        
        currentStep+=incrementor
        showCurrentStep()
    }
    
})

//classList.toggle->當元素上沒有這個 class 時，會新增 ; 反之已經存在的話則移除。
function showCurrentStep() {
    formSteps.forEach((step, index) => {
        step.classList.toggle("active", index === currentStep)
    })
}

const fileUploader = document.getElementById('fileUpload');
fileUploader.addEventListener('change', (event) => {
    const formData = new FormData();
  //formData.append('fileUpload', input.files[0]);
    formData.append('fileUpload', $('input[name="fileUpload"]').get(0).files[0]);
    console.log( $('input[name="fileUpload"]').get(0).files[0]);
    $.ajax({
        type: "POST",
        url: 'http://127.0.0.1:3000/uploadPhoto',
        data: formData,
        processData : false, 
        contentType : false,
        dataType: "json",
        success: function(data) {
        console.log(data);
        }
    });
  });

  
  $("#ownerForm").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');
    
    $.ajax({
        type: "POST",
        url: "/ownerInfo",
        data: form.serialize(), // serializes the form's elements.
        success: function(data)
        {
          alert(data); // show response from the php script.
        }
    });
    
});
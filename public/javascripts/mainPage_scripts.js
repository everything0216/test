//增加搭乘時間
//Client ID:73d766fcb0de170 Client secret:d15fa884f676e9c4d5ec0528b4c9f510ce72b76d
//https://imgur.com/#access_token=367fae1c61694fbd3b82c7eac77fb680f6d32a52&expires_in=315360000&token_type=bearer&refresh_token=d6cd7b8e0e067ba6f6292f0e85a7d1c24543efcb&account_username=face021616&account_id=59042281
$(window).ready(function(){
	checkLogin();
	$(".container").empty();
	listPassengers();
	$("#btn_logout").click(function(){
		logout();
	});
})

var passengers = [];
function checkLogin(){
	if(sessionStorage.getItem("account") == null) {
		swal({
			title:"請先登入",
			text: "還沒有登入唷! 要去登入嗎?",
			icon: "warning",
			buttons: {
				cancel: {
					text: "不用了",
					value: "no",
					visible: true
				},
				comfirm: {
					text: "好~",
					value: "yes",
					color:"red",
					visible: true
				}
			}
		}).then((choice) => {
			if(choice == "yes") {
				location.href = "SignIn.html";
			}
		});
	}
}
function listPassengers(){
	$.ajax({
		url: '/listPassenger',
		type: 'post',
		success: function(data){													
			for(i = 0; i < data.result.length; i++){
				if(data.result[i]){
					passengers[i] = data.result[i];
					$('.container').append(
						'<div class="card" id="'+i+'">'+
							'<div class="card-body">'+
								'<h5 class="card-title">'+data.result[i].name+'</h5>'+
								'<h6 class="card-subtitle mb-2 text-muted">'+data.result[i].gender+'</h6>'+
								'<p class="card-text">'+'搭乘地點: '+data.result[i].takingPlace+'<br>'+'搭乘時間: '+data.result[i].takingTime+'<br>'+'目的地: '+data.result[i].destination+'<br>'+'其他資訊: '+data.result[i].other+'<br>'+'備註: '+data.result[i].remark+'<br>'+'</p>'+
								'<button type="button" class="btn btn-outline-success" id="accept'+i+'" onclick="acceptRequest('+i+')">接受</button>'+
								'<button type="button" class="btn btn-outline-success" id="reject'+i+'" data-bs-toggle="modal" data-bs-target="#staticBackdrop'+i+'" onclick="removeCard('+i+')">拒絕</button>'+
							'</div>'+
						'<div class="modal fade" id="staticBackdrop'+i+'" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel'+i+'" aria-hidden="true">'+
							'<div class="modal-dialog">'+
								'<div class="modal-content">'+
									'<div class="modal-header">'+
										'<h5 class="modal-title" id="staticBackdropLabel'+i+'">拒絕原因</h5>'+
										'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
									'</div>'+
									'<div class="modal-body">'+
										// '<iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>' +
										// '<form action="/denyOrder" method="post" target="dummyframe">'+
											// '<input type="hidden" name="account" value="'+data.result[i].account+'">'+
											'<input type="text" class="other_info" name="denyReason" id="input_denyReason'+i+'" value="" height="50px" width="50px">'+
											
											'<div class="modal-footer">'+
												'<button type="submit" id="btn_denyOrder'+i+'" class="btn btn-outline-success" data-bs-dismiss="modal" onclick="denyRequest('+i+')">確認</button>'+
											'</div>'+
										// '</form>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'
					)
				}
				else swal("目前沒有共乘邀請喔!", "", "warning");
			}
		},
		error: function(){
			alert("wrong");
		}
    });
}

function logout(){
	$.ajax({
		url: '/logout',
		type: 'POST',
		success:function(logoutRes){
			if(logoutRes.result == "logout succ"){
				sessionStorage.removeItem("account");
				swal({
                    title: "登出成功 !",
                    icon: "success",
                }).then(function () {
                    location.href="/SignIn.html";
                });
			}
			else{
				swal("登出失敗!", "", "warning");
			}
		},
		error: function(){
			alert("登出失敗!");
		}    
	});
}

function removeCard(num){
    var eDiv = document.getElementById(num);
    eDiv.parentNode.removeChild(eDiv);
}

function acceptRequest(num){
	if(sessionStorage.getItem("account") == null) {
		swal({
			title:"請先登入",
			text: "登入後才可以接受喔!",
			icon: "info",
		}).then(() => {
			location.href = "SignIn.html";
		});
	}
	else{
		$.ajax({
			url: '/acceptOrder',
			type: 'POST',
			data: {account: passengers[num].account},
			success:function(acceptRes){
				if(acceptRes.result == "accept request succ"){
					location.href = "/going.html"  
				}
			},
			error: function(){
				alert("accept order error");
			}       
		})
	}
}

function denyRequest(num){
	if(sessionStorage.getItem("account") == null) {
		swal({
			title:"請先登入",
			text: "登入後才可以拒絕別人喔!",
			icon: "info",
		}).then(() => {
			location.href = "SignIn.html";
		});
	}
	else{
		$.ajax({
			url: '/denyOrder',
			type: 'POST',
			data: {account: passengers[num].account, denyReason : $('#input_denyReason'+num+'').val()},
			error: function(){
				alert("deny order error");
			}       
		})
	}
}

function uploadPicture(){
	const input = document.querySelector('#fileUpload');

	const formData = new FormData();
	//formData.append('fileUpload', input.files[0]);
	formData.append('fileUpload', $('input[name="fileUpload"]').get(0).files[0]);
	console.log( $('input[name="fileUpload"]').get(0).files[0]);
	$.ajax({
		type: "POST",
		url: '/uploadPhoto',
		data: formData,
		processData : false, 
		contentType : false,
		dataType: "json",
		success: function(data) {
			console.log(data);
		}
	});
  
  
}


$('.close').click(function(){
    var $target = $(this).parent('div');
    $target.hide('slow',function(){$target.remove();})
})


$("#ownerBasicForm").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');
    
    $.ajax({
        type: "POST",
        url: "/changeOwnerBasic",
        data: form.serialize(), // serializes the form's elements.
        success: function(data)
        {
          alert(data); // show response from the php script.
        }
    });
    
});


$("#ownerTimeForm").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');
    
    $.ajax({
        type: "POST",
        url: "/changeOwnerTime",
        data: form.serialize(), // serializes the form's elements.
        success: function(data)
        {
          alert(data); // show response from the php script.
        }
    });
    
});


$("#ownerLocForm").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');
    
    $.ajax({
        type: "POST",
        url: "/hangeOwnerLoc",
        data: form.serialize(), // serializes the form's elements.
        success: function(data)
        {
          alert(data); // show response from the php script.
        }
    });
    
});
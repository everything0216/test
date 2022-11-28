const webPush = require("web-push");
const vapidKeys = webpush.generateVAPIDKeys();
const applicationServerPublicKey = vapidKeys.publicKey;
//setting vapid keys details
webPush.setVapidDetails("mailto:SW@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);
console.log("[publicKey] = " + vapidKeys.publicKey);
console.log("[privateKey] = " + vapidKeys.privateKey);


if ("serviceWorker" in navigator && "PushManager" in window) {
    console.log('[succ] Service Worker and Push is supported.');
    navigator.serviceWorker.register('/sw.js')
    .then(function(swReg){
        console.log('[succ] Service Worker is registered', swReg);
        swRegistration = swReg;
        initializeUI();
    })
    .catch(function(err){
        console.error('Service Worker Error', err);
    });
}else {
    console.log('[err] Push is not supported.');
}

function initializeUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
          // TODO: Unsubscribe user
        } else {
          subscribeUser();
        }
      });
    
      // Set the initial subscription value
      swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        isSubscribed = !(subscription === null);
    
        updateSubscriptionOnServer(subscription);
    
        if (isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
        }
    
        updateBtn();
      });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
      }
    
      if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
      } else {
        pushButton.textContent = 'Enable Push Messaging';
      }
    
      pushButton.disabled = false;
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}   

function subscribeUser() {
    const applicationServerKey = urlBase64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
        console.log('User is subscribed.');

        updateSubscriptionOnServer(subscription);

        isSubscribed = true;

        updateBtn();
    })
    .catch(function(error) {
        console.error('Failed to subscribe the user: ', error);
        updateBtn();
    });
}

function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });
  
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== "granted") {
            throw new Error("[err] We weren't granted permission.");
        }
    });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
  
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');
  
    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      subscriptionDetails.classList.remove('is-invisible');
    } else {
      subscriptionDetails.classList.add('is-invisible');
    }
}
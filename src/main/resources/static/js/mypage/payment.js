// 배송지 출입 팝업 창 열기
function openDelivEnterMethod() { 
    const popupWidth = 350;
    const popupHeight = 310;
    const popupX = (window.screen.width / 2) - (popupWidth / 2);
    const popupY = (window.screen.height / 2) - (popupHeight / 2);
    
    window.open('/mypage/payment/delivEnterMethod', 'delivEnterMethod', `width=${popupWidth},height=${popupHeight},left=${popupX},top=${popupY},resizable=no`);
}

// 배송 메모 팝업 창 열기
function openDelivMemo() { 
    const popupWidth = 350;
    const popupHeight = 370;
    const popupX = (window.screen.width / 2) - (popupWidth / 2);
    const popupY = (window.screen.height / 2) - (popupHeight / 2);
    
    window.open('/mypage/payment/delivMemo', 'delivMemo', `width=${popupWidth},height=${popupHeight},left=${popupX},top=${popupY},resizable=no`);
}

function handleOptionChange(selectedOption) {
    // 모든 input 창 숨기기
    document.querySelectorAll('.option-input').forEach(input => {
        input.style.display = 'none';
    });

    // 선택된 옵션에 맞는 input 창만 표시
    const inputId = `input-${selectedOption.value}`;
    const targetInput = document.getElementById(inputId);
    if (targetInput) {
        targetInput.style.display = 'block';
    }

    // 저장 버튼 활성화
    document.getElementById('save-btn').disabled = false;
}

function saveDeliveryOption() {
    // 선택된 라디오 버튼과 입력값 확인
    const selectedMethod = document.querySelector('input[name="delivOption"]:checked');
    const methodText = selectedMethod.nextSibling.textContent.trim();
    const inputId = `input-${selectedMethod.value}`;
    const inputValue = document.getElementById(inputId)?.value || '';

    // 입력값 검증 (두 번째 옵션은 검증 없이 통과)
    if (selectedMethod.value !== 'freeEntry' && !inputValue) {
        document.getElementById(inputId).focus();
        return;
    }

    // 부모 창에 값 전달 및 창 닫기
    window.opener.document.getElementById("delivEnterMethod").value = `${methodText} / ${inputValue}`;
    window.close();
}

function saveMemoOption() {
    // 선택된 라디오 버튼과 입력값 확인
    const selectedMethod = document.querySelector('input[name="delivOption"]:checked');
    let methodText = selectedMethod.nextSibling.textContent.trim();
    const inputId = `input-${selectedMethod.value}`;
    const inputValue = document.getElementById(inputId)?.value || '';
	
	// 입력값 검증 및 입력값을 최종 전달값으로 전환
    if (selectedMethod.value == 'other' && !inputValue) {
        document.getElementById(inputId).focus();
        return;
    } else if (selectedMethod.value == 'other' && inputValue) {
		methodText = inputValue;
	}

    // 부모 창에 값 전달 및 창 닫기
    window.opener.document.getElementById("delivMemo").value = `${methodText}`;
    window.close();
}

// 쿠폰 사용 팝업 창 열기
function openUsableCoupon() { 
    const popupWidth = 500;
    const popupHeight = 700;
    const popupX = (window.screen.width / 2) - (popupWidth / 2);
    const popupY = (window.screen.height / 2) - (popupHeight / 2);
    
    window.open('/mypage/payment/usableCoupon', 'usableCoupon', `width=${popupWidth},height=${popupHeight},left=${popupX},top=${popupY},resizable=no`);
}

// 현재 포인트 값 저장을 위한 전역 변수
let currentPointValue = 0;
// 초기 포인트 값 설정을 위한 전역 변수
let initialUsablePoints = 0;

document.addEventListener('DOMContentLoaded', function () {
	initialUsablePoints = parseInt(document.getElementById('usable_point').textContent.replace(/[^0-9]/g, ''));
    updateSummary(0);
});

function couponUse(couponName, couponType, couponAmount) {
	// 부모 창의 'usableCoupon' 입력창에 쿠폰 이름 설정
    window.opener.document.getElementById("usableCoupon").value = couponName;

    // 부모 창의 숨겨진 필드에 쿠폰 금액과 타입 전달 (동적 합계 계산을 위해)
    window.opener.document.getElementById("couponAmount").value = couponAmount;
    window.opener.document.getElementById("couponType").value = couponType;
	
	// 현재 포인트 값을 제거하며 합계 갱신
	window.opener.document.querySelector('.point-option input').value = 0;
	window.opener.pointUse();
	window.opener.updateSummary(0);

	// 팝업 닫기
	window.close();
}

function pointUse() {
    currentPointValue = parseInt(document.querySelector('.point-option input').value) || 0;
	const finalPrice = parseInt(document.getElementById('final_price').textContent.replace(/[^0-9]/g, ''));

    // 입력값이 사용 가능한 포인트보다 클 경우 제한
	if (currentPointValue > initialUsablePoints) {
        currentPointValue = initialUsablePoints;
        document.querySelector('.point-option input').value = initialUsablePoints;
    }
    // 입력값이 결제금액보다 클 경우 제한
	if (currentPointValue > finalPrice)	{
       currentPointValue = finalPrice;
       document.querySelector('.point-option input').value = finalPrice;
   }
	
	updateSummary(currentPointValue);
	
    document.getElementById('usable_point').textContent = `${(initialUsablePoints - currentPointValue).toLocaleString()}원`;
}

// 전액사용 클릭
function pointUseAll() {
    const finalPrice = parseInt(document.getElementById('final_price').textContent.replace(/[^0-9]/g, ''));

	if (finalPrice >= initialUsablePoints) {
        currentPointValue = initialUsablePoints;
    } else {
        currentPointValue = finalPrice;
    }

	document.querySelector('.point-option input').value = currentPointValue;
    updateSummary(currentPointValue);
    document.getElementById('usable_point').textContent = `${(initialUsablePoints - currentPointValue).toLocaleString()}원`;
}

// 동적 합계 계산
function updateSummary(discountPoint) {
    const priceSum = parseInt(document.getElementById('price_sum').textContent.replace(/[^0-9]/g, ''));
    const priceDeliv = 3000;
    const couponAmount = parseInt(document.getElementById('couponAmount').value);
    const couponType = document.getElementById('couponType').value;
	
    let discountCoupon = 0;

    if (couponType === 'R') {
        discountCoupon = (priceSum / 100) * couponAmount;
    } else if (couponType === 'A') {
        discountCoupon = couponAmount;
    }
	
    let finalPrice = priceSum + priceDeliv - discountCoupon - discountPoint;
	
	// 음수 여부 확인 및 처리
    if (finalPrice < 0) {
        const remainingNegative = Math.abs(finalPrice);
		
        // 쿠폰 금액을 줄여서 조정
        finalPrice = 0;
        discountCoupon -= remainingNegative;
    }
	
    const finalPoint = (finalPrice / 100) * parseFloat(document.body.dataset.userRate);
	
    document.getElementById('price_deliv').textContent = `+${priceDeliv.toLocaleString()}원`;
    document.getElementById('discount_coupon').textContent = `-${discountCoupon.toLocaleString()}원`;
    document.getElementById('discount_point').textContent = `-${discountPoint.toLocaleString()}원`;
    document.getElementById('final_price').textContent = `${finalPrice.toLocaleString()}원`;
    document.getElementById('final_point').textContent = `${finalPoint.toFixed(0).toLocaleString()}원 적립`;
}
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const propertyTypeSelect = document.getElementById('propertyType'); // 부동산 유형 선택
    const regulatedAreaField = document.getElementById('regulatedAreaField'); // 조정대상지역 여부 필드
    const singleHouseExemptionField = document.getElementById('singleHouseExemptionField'); // 1세대 1주택 여부 필드
    const acquisitionDateInput = document.getElementById('acquisitionDate'); // 취득일 입력
    const transferDateInput = document.getElementById('transferDate'); // 양도일 입력
    const holdingYearsDisplay = document.getElementById('holdingYearsDisplay'); // 보유 기간 표시
    const calculateButton = document.getElementById('calculateButton'); // 계산 버튼
    const toggleAcquisitionButton = document.getElementById('toggleAcquisitionButton'); // 취득가액 버튼
    const acquisitionModal = document.getElementById('acquisitionModal'); // 취득가액 모달
    const closeAcquisitionModal = document.getElementById('closeAcquisitionModal'); // 취득가액 모달 닫기 버튼
    const saveAcquisitionButton = document.getElementById('saveAcquisition'); // 취득가액 저장 버튼
    const totalAcquisitionDisplay = document.getElementById('totalAcquisitionDisplay'); // 취득가액 표시
    const toggleExpensesButton = document.getElementById('toggleExpensesButton'); // 필요경비 버튼
    const expensesModal = document.getElementById('expensesModal'); // 필요경비 모달
    const closeExpensesModal = document.getElementById('closeExpensesModal'); // 필요경비 모달 닫기 버튼
    const saveExpensesButton = document.getElementById('saveExpenses'); // 필요경비 저장 버튼
    const totalExpensesDisplay = document.getElementById('totalExpensesDisplay'); // 필요경비 표시

    // 상태 변수
    let isAcquisitionModalOpen = false; // 취득가액 모달 상태
    let isExpensesModalOpen = false; // 필요경비 모달 상태

   // 방어 코드 추가: 모든 요소가 null인지 확인
if (!propertyTypeSelect || !regulatedAreaField || !singleHouseExemptionField || !acquisitionDateInput || !transferDateInput || !calculateButton) {
    console.error('필수 요소가 HTML에 누락되었습니다. HTML 구조를 점검하세요.');
    return;
}

    // 숫자 입력에 콤마 추가
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (['acquisitionPrice', 'acquisitionCost', 'transferPrice'].includes(target.id) || target.closest('#expensesModal')) {
            const rawValue = target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
            target.value = rawValue ? parseInt(rawValue, 10).toLocaleString() : ''; // 콤마 추가
        }
    });

    // 부동산 유형에 따라 필드 표시/숨김
    const updateFieldsByPropertyType = () => {
        const propertyType = propertyTypeSelect.value;
        if (propertyType === 'house') {
            regulatedAreaField.style.display = 'block';
            singleHouseExemptionField.style.display = 'block';
        } else {
            regulatedAreaField.style.display = 'none';
            singleHouseExemptionField.style.display = 'none';
        }
    };

    propertyTypeSelect.addEventListener('change', updateFieldsByPropertyType);
    updateFieldsByPropertyType();

    // 보유 기간 자동 계산
    const calculateHoldingYears = () => {
        const acquisitionDate = new Date(acquisitionDateInput.value);
        const transferDate = new Date(transferDateInput.value);

        if (isNaN(acquisitionDate) || isNaN(transferDate)) {
            holdingYearsDisplay.value = '날짜를 입력하세요.';
            return;
        }

        const diffInMilliseconds = transferDate - acquisitionDate;
        if (diffInMilliseconds < 0) {
            holdingYearsDisplay.value = '양도일이 취득일보다 빠릅니다.';
            return;
        }

        const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365);
        holdingYearsDisplay.value = diffInYears.toFixed(2) + '년';
    };

    acquisitionDateInput.addEventListener('change', calculateHoldingYears);
    transferDateInput.addEventListener('change', calculateHoldingYears);
    // 모달 열기/닫기 공통 함수
    const openModal = (modal) => {
        modal.style.display = 'block';
    };

    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // 취득가액 모달 열기/닫기
    toggleAcquisitionButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (isAcquisitionModalOpen) {
            closeModal(acquisitionModal);
        } else {
            openModal(acquisitionModal);
        }
        isAcquisitionModalOpen = !isAcquisitionModalOpen;
    });

    closeAcquisitionModal.addEventListener('click', (event) => {
        event.preventDefault();
        closeModal(acquisitionModal);
        isAcquisitionModalOpen = false;
    });

    // 취득가액 저장
    saveAcquisitionButton.addEventListener('click', () => {
        // 취득가액과 취득 경비 입력 필드 가져오기
        const acquisitionPriceElement = document.getElementById('acquisitionPrice');
        const acquisitionCostElement = document.getElementById('acquisitionCost');

        // 값 읽기, 없으면 0으로 처리
        const acquisitionPrice = acquisitionPriceElement ? parseInt(acquisitionPriceElement.value.replace(/,/g, '') || '0', 10) : 0;
        const acquisitionCost = acquisitionCostElement ? parseInt(acquisitionCostElement.value.replace(/,/g, '') || '0', 10) : 0;

        // 총 취득가액 계산
        const totalAcquisition = acquisitionPrice + acquisitionCost;

        // 결과 표시
        totalAcquisitionDisplay.textContent = `총 취득가액: ${totalAcquisition.toLocaleString()} 원`;

        // 모달 닫기
        closeModal(acquisitionModal);
        isAcquisitionModalOpen = false;
    });

    // 필요경비 모달 열기/닫기
toggleExpensesButton.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(expensesModal);
});

closeExpensesModal.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal(expensesModal);
});

// 필요경비 저장
saveExpensesButton.addEventListener('click', () => {
    let totalExpenses = 0;

    // 각 입력 필드의 값을 읽어 합산
    document.querySelectorAll('#expensesModal input[type="text"]').forEach((input) => {
        const value = input.value.replace(/,/g, ''); // 입력값에서 콤마 제거
        totalExpenses += parseInt(value || '0', 10); // 숫자로 변환 후 합산
    });

    // 총 필요경비 표시
    totalExpensesDisplay.textContent = `총 필요경비: ${totalExpenses.toLocaleString()} 원`;

    // 모달 닫기
    closeModal(expensesModal);
});

// 필요경비 입력 필드 상태 관리
document.querySelectorAll('#expensesModal input[type="text"]').forEach((input) => {
    input.addEventListener('input', () => {
        // 사용자가 값을 입력하면 자동으로 체크된 상태로 변경
        const checkbox = document.getElementById(input.id.replace('Amount', ''));
        if (checkbox) checkbox.checked = !!input.value.trim();
    });
});
   
// 계산 버튼 클릭 이벤트
calculateButton.addEventListener('click', () => {
    const acquisitionDate = new Date(acquisitionDateInput.value);
    const transferDate = new Date(transferDateInput.value);

    // 보유 기간 계산
    if (isNaN(acquisitionDate) || isNaN(transferDate)) {
        alert('취득일과 양도일을 입력해주세요.');
        return;
    }

    const diffInMilliseconds = transferDate - acquisitionDate;
    if (diffInMilliseconds < 0) {
        alert('양도일이 취득일보다 빠를 수 없습니다.');
        return;
    }

    const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365);
    const holdingYears = parseFloat(diffInYears.toFixed(2)); // 소수점 2자리까지만 유지
    const holdingYearsInt = Math.floor(holdingYears); // 소수점 버림하여 정수화
    holdingYearsDisplay.value = `${holdingYearsInt} 년`; // UI에 정수화된 보유 기간 표시

    // 양도차익 계산
    const acquisitionPrice = parseInt(totalAcquisitionDisplay.textContent.replace(/[^0-9]/g, '') || '0', 10); // 취득가액
    const expenses = parseInt(totalExpensesDisplay.textContent.replace(/[^0-9]/g, '') || '0', 10); // 필요경비
    const transferPrice = parseInt(document.getElementById('transferPrice')?.value.replace(/,/g, '') || '0', 10); // 양도가액
    const profit = transferPrice - acquisitionPrice - expenses;

    if (profit < 0) {
        alert('양도차익이 0보다 작습니다. 입력값을 확인해주세요.');
        return;
    }

    // 기본 세율 및 장기보유특별공제율 계산
    let taxRate = 0;
    let surcharge = 0;
    let longTermDeductionRate = 0;

    if (propertyTypeSelect.value === 'house') {
        const regulatedArea = document.getElementById('regulatedArea').value === 'yes';
        const singleHouseExemption = document.getElementById('singleHouseExemption').value === 'yes';

        if (singleHouseExemption) {
            longTermDeductionRate = holdingYearsInt >= 2 ? Math.min(holdingYearsInt * 0.04, 0.8) : 0;
        } else {
            longTermDeductionRate = holdingYearsInt >= 3 ? Math.min(holdingYearsInt * 0.02, 0.3) : 0;
        }

        taxRate = regulatedArea ? 0.2 : 0.1; // 기본 세율 설정
        surcharge = regulatedArea ? 0.1 : 0; // 조정대상지역 중과세율
    } else if (propertyTypeSelect.value === 'landForest') {
        longTermDeductionRate = holdingYearsInt >= 3 ? Math.min(holdingYearsInt * 0.03, 0.3) : 0;
        taxRate = 0.15; // 기본 세율
    } else if (propertyTypeSelect.value === 'unregistered') {
        longTermDeductionRate = 0; // 미등기부동산은 장기보유특별공제 없음
        taxRate = 0.7; // 고정 세율 70%
    } else if (propertyTypeSelect.value === 'others') {
        longTermDeductionRate = 0;
        taxRate = 0.2; // 기타 권리는 고정 세율로 20%
    }

    // 과세표준 계산 (장기보유특별공제 반영)
    let taxableProfit = profit * (1 - longTermDeductionRate);

    console.log("1. 장기보유특별공제 반영 후 과세표준 (taxableProfit): ", taxableProfit.toLocaleString());

    // 비과세 조건 적용
    if (propertyTypeSelect.value === 'house' && singleHouseExemption) {
        if (holdingYearsInt >= 2) { // 보유기간 2년 이상
            const taxExemptLimit = 1200000000; // 비과세 한도 12억
            if (transferPrice <= taxExemptLimit) {
                taxableProfit = 0; // 12억 이하 양도가액 전액 비과세
            } else {
                taxableProfit = Math.max(profit - (taxExemptLimit - acquisitionPrice), 0); // 12억 초과분만 과세
            }
        }
    }

    console.log("2. 비과세 조건 적용 후 과세표준 (taxableProfit): ", taxableProfit.toLocaleString());

    // 기본공제 적용 (과세표준에서 차감)
    const basicDeduction = propertyTypeSelect.value !== 'unregistered' ? 2500000 : 0; // 미등기 부동산 기본공제 없음
    let taxableProfitAfterDeduction = Math.max(taxableProfit - basicDeduction, 0); // taxableProfit에서 기본공제를 차감

    console.log("3. 기본공제 적용 후 과세표준 (taxableProfitAfterDeduction): ", taxableProfitAfterDeduction.toLocaleString());
 
// 누진세율 구간 및 누진공제 설정
const taxBrackets = [
    { limit: 12000000, rate: 0.06, deduction: 0 },
    { limit: 46000000, rate: 0.15, deduction: 1080000 },
    { limit: 88000000, rate: 0.24, deduction: 5220000 },
    { limit: 150000000, rate: 0.35, deduction: 14900000 },
    { limit: 300000000, rate: 0.38, deduction: 19400000 },
    { limit: 500000000, rate: 0.40, deduction: 25400000 },
    { limit: Infinity, rate: 0.45, deduction: 45400000 }
];

// 초기 값 디버깅
console.log("1. 장기보유특별공제율:", (longTermDeductionRate * 100).toFixed(1), "%");
console.log("2. 양도차익 (profit):", profit.toLocaleString(), "원");
console.log("3. 과세표준 (기본공제 전):", taxableProfit.toLocaleString(), "원");
console.log("4. 기본공제:", basicDeduction.toLocaleString(), "원");
console.log("5. 과세표준 (기본공제 후):", taxableProfitAfterDeduction.toLocaleString(), "원");

let rawTax = 0; // 양도소득세
let remainingProfit = taxableProfitAfterDeduction; // 남은 과세표준

console.log("6. 누진세율 계산 시작...");
for (const bracket of taxBrackets) {
    if (remainingProfit <= 0) break; // 남은 금액이 0 이하라면 중단
    if (remainingProfit <= bracket.limit) {
        // 현재 구간의 남은 금액을 모두 과세
        const taxForBracket = remainingProfit * bracket.rate;
        rawTax += taxForBracket;
        console.log(` - 구간 ${bracket.limit.toLocaleString()} 원: ${taxForBracket.toLocaleString()} 원 (세율 ${bracket.rate * 100}%)`);
        break;
    } else {
        // 현재 구간 한도까지만 과세
        const taxForBracket = (bracket.limit - (taxBrackets[taxBrackets.indexOf(bracket) - 1]?.limit || 0)) * bracket.rate;
        rawTax += taxForBracket;
        remainingProfit -= bracket.limit; // 남은 금액 갱신
        console.log(` - 구간 ${bracket.limit.toLocaleString()} 원: ${taxForBracket.toLocaleString()} 원 (세율 ${bracket.rate * 100}%)`);
    }
}

// 누진공제 적용
const applicableDeduction = taxBrackets.find(bracket => taxableProfitAfterDeduction <= bracket.limit)?.deduction || 0;
rawTax -= applicableDeduction;

console.log("7. 누진공제:", applicableDeduction.toLocaleString(), "원");
console.log("8. 누진공제 적용 후 양도소득세 (rawTax):", rawTax.toLocaleString(), "원");

// 부가세 계산
const educationTax = Math.floor(rawTax * 0.1); // 지방교육세 (10%)
const ruralTax = Math.floor(rawTax * 0.2); // 농어촌특별세 (20%)
const totalTax = rawTax + educationTax + ruralTax;

console.log("9. 지방교육세 (educationTax):", educationTax.toLocaleString(), "원");
console.log("10. 농어촌특별세 (ruralTax):", ruralTax.toLocaleString(), "원");
console.log("11. 총 세금 (totalTax):", totalTax.toLocaleString(), "원");

// 결과 출력
document.getElementById('result').innerHTML = `
    <h3>계산 결과</h3>
    <p>보유 기간: ${holdingYearsInt} 년</p>
    <p>장기보유특별공제율: ${(longTermDeductionRate * 100).toFixed(1)}%</p>
    <p>양도차익: ${profit.toLocaleString()} 원</p>
    <p>과세표준 (기본공제 전): ${taxableProfit.toLocaleString()} 원</p>
    <p>기본공제: ${basicDeduction.toLocaleString()} 원</p>
    <p>과세표준 (기본공제 후): ${taxableProfitAfterDeduction.toLocaleString()} 원</p>
    <p>양도소득세: ${rawTax.toLocaleString()} 원</p>
    <p>지방교육세: ${educationTax.toLocaleString()} 원</p>
    <p>농어촌특별세: ${ruralTax.toLocaleString()} 원</p>
    <p><strong>총 세금: ${totalTax.toLocaleString()} 원</strong></p>
`;

});
  
}); // <== 마지막 닫는 괄호 추가

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

    // 숫자 입력에 콤마 추가
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (['acquisitionPrice', 'transferPrice'].includes(target.id) || target.closest('#expensesModal')) {
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
    // 취득가액 모달 열기
    toggleAcquisitionButton.addEventListener('click', () => {
        acquisitionModal.style.display = 'block';
    });

    // 취득가액 모달 닫기
    closeAcquisitionModal.addEventListener('click', () => {
        acquisitionModal.style.display = 'none';
    });

    // 취득가액 저장
    saveAcquisitionButton.addEventListener('click', () => {
        const acquisitionPrice = parseInt(document.getElementById('acquisitionPrice').value.replace(/,/g, '') || '0', 10);
        totalAcquisitionDisplay.textContent = `총 취득가액: ${acquisitionPrice.toLocaleString()} 원`;
        acquisitionModal.style.display = 'none';
    });

    // 필요경비 모달 열기
    toggleExpensesButton.addEventListener('click', () => {
        expensesModal.style.display = 'block';
    });

    // 필요경비 모달 닫기
    closeExpensesModal.addEventListener('click', () => {
        expensesModal.style.display = 'none';
    });

    // 필요경비 저장
    saveExpensesButton.addEventListener('click', () => {
        let totalExpenses = 0;
        document.querySelectorAll('#expensesModal input[type="text"]').forEach((input) => {
            const value = input.value.replace(/,/g, ''); // 콤마 제거
            totalExpenses += parseInt(value || '0', 10); // 합산
        });
        totalExpensesDisplay.textContent = `총 필요경비: ${totalExpenses.toLocaleString()} 원`;
        expensesModal.style.display = 'none';
    });

    // 체크박스 상태에 따른 입력 필드 활성화/비활성화
    document.querySelectorAll('#expensesModal input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const amountField = document.getElementById(`${event.target.id}Amount`);
            amountField.disabled = !event.target.checked;
            if (!event.target.checked) {
                amountField.value = ''; // 체크 해제 시 초기화
            }
        });
    });
    
    // 계산 버튼 클릭 이벤트
    calculateButton.addEventListener('click', () => {
        const acquisitionPrice = parseInt(totalAcquisitionDisplay.textContent.replace(/[^0-9]/g, '') || '0', 10); // 취득가액
        const expenses = parseInt(totalExpensesDisplay.textContent.replace(/[^0-9]/g, '') || '0', 10); // 필요경비
        const transferPrice = parseInt(document.getElementById('transferPrice').value.replace(/,/g, '') || '0', 10); // 양도가액

        // 양도차익 계산
        const profit = transferPrice - acquisitionPrice - expenses;

        // 기본 세율 및 중과세
        let taxRate = 0;
        let surcharge = 0;
        let longTermDeductionRate = 0;

        if (propertyTypeSelect.value === 'house') {
            const regulatedArea = document.getElementById('regulatedArea').value === 'yes';
            const singleHouseExemption = document.getElementById('singleHouseExemption').value === 'yes';

            if (singleHouseExemption) {
                longTermDeductionRate = holdingYearsDisplay.value >= 2 ? Math.min(holdingYearsDisplay.value * 0.04, 0.8) : 0;
            } else {
                longTermDeductionRate = holdingYearsDisplay.value >= 3 ? Math.min(holdingYearsDisplay.value * 0.02, 0.3) : 0;
            }

            taxRate = regulatedArea ? 0.2 : 0.1;
            surcharge = regulatedArea ? 0.1 : 0;
        } else if (propertyTypeSelect.value === 'landForest') {
            longTermDeductionRate = holdingYearsDisplay.value >= 3 ? Math.min(holdingYearsDisplay.value * 0.03, 0.3) : 0;
            taxRate = 0.15;
        } else if (propertyTypeSelect.value === 'commercial') {
            longTermDeductionRate = holdingYearsDisplay.value >= 3 ? Math.min(holdingYearsDisplay.value * 0.03, 0.3) : 0;
            taxRate = 0.2;
        }

        // 과세표준 계산 (장기보유특별공제 반영)
        const taxableProfit = profit * (1 - longTermDeductionRate);

        // 양도소득세 계산
        const tax = Math.floor(taxableProfit * taxRate + taxableProfit * surcharge);

        // 부가세 계산
        const educationTax = Math.floor(tax * 0.1); // 지방교육세 (10%)
        const ruralTax = Math.floor(tax * 0.2); // 농어촌특별세 (20%)
        const totalTax = tax + educationTax + ruralTax;

        // 결과 출력
        document.getElementById('result').innerHTML = `
            <h3>계산 결과</h3>
            <p>양도차익: ${profit.toLocaleString()} 원</p>
            <p>장기보유특별공제: ${(longTermDeductionRate * 100).toFixed(1)}%</p>
            <p>과세표준: ${taxableProfit.toLocaleString()} 원</p>
            <p>기본 세율: ${(taxRate * 100).toFixed(1)}%</p>
            <p>중과세율: ${(surcharge * 100).toFixed(1)}%</p>
            <p>양도소득세: ${tax.toLocaleString()} 원</p>
            <p>지방교육세: ${educationTax.toLocaleString()} 원</p>
            <p>농어촌특별세: ${ruralTax.toLocaleString()} 원</p>
            <p><strong>총 세금: ${totalTax.toLocaleString()} 원</strong></p>
        `;
    });
});

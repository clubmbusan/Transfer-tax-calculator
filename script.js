document.addEventListener('DOMContentLoaded', () => {
    const propertyTypeSelect = document.getElementById('propertyType'); // 부동산 유형 선택
    const regulatedAreaField = document.getElementById('regulatedAreaField'); // 조정대상지역 여부 필드
    const singleHouseExemptionField = document.getElementById('singleHouseExemptionField'); // 1세대 1주택 여부 필드
    const acquisitionDateInput = document.getElementById('acquisitionDate'); // 취득일 입력
    const transferDateInput = document.getElementById('transferDate'); // 양도일 입력
    const holdingYearsDisplay = document.getElementById('holdingYearsDisplay'); // 보유 기간 표시
    const calculateButton = document.getElementById('calculateButton'); // 계산 버튼
    const toggleButton = document.getElementById('toggleExpensesButton'); // 필요경비 입력 버튼
    const expensesContainer = document.getElementById('expensesContainer'); // 필요경비 입력 필드 컨테이너
    const totalExpensesDisplay = document.getElementById('totalExpensesDisplay'); // 총 필요경비 표시

    let isExpensesContainerVisible = false; // 필요경비 필드 표시 여부 상태

    // 숫자 입력에 콤마 추가 (필요경비 포함)
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (['acquisitionPrice', 'transferPrice'].includes(target.id) || target.closest('#expensesList')) {
            const rawValue = target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
            target.value = rawValue ? parseInt(rawValue, 10).toLocaleString() : ''; // 콤마 추가
        }
    });

    // 부동산 유형에 따라 필드 표시/숨김
    const updateFieldsByPropertyType = () => {
        const propertyType = propertyTypeSelect.value; // 부동산 유형 값 가져오기

        if (propertyType === 'house') {
            // 주택: 조정대상지역 여부, 1세대 1주택 여부 필드 표시
            regulatedAreaField.style.display = 'block';
            singleHouseExemptionField.style.display = 'block';
        } else if (propertyType === 'commercial' || propertyType === 'landForest') {
            // 상가, 토지/임야: 해당 필드 숨김
            regulatedAreaField.style.display = 'none';
            singleHouseExemptionField.style.display = 'none';
        }
    };

    // 초기화 및 이벤트 연결
    propertyTypeSelect.addEventListener('change', updateFieldsByPropertyType); // 유형 변경 시 업데이트
    updateFieldsByPropertyType(); // 초기 상태 설정

    // 보유 기간 자동 계산
    const calculateHoldingYears = () => {
        const acquisitionDate = new Date(acquisitionDateInput.value); // 취득일
        const transferDate = new Date(transferDateInput.value); // 양도일

        if (isNaN(acquisitionDate) || isNaN(transferDate)) {
            holdingYearsDisplay.value = '날짜를 입력하세요.'; // 날짜 입력 오류 메시지
            return;
        }

        const diffInMilliseconds = transferDate - acquisitionDate; // 두 날짜 간 차이 계산
        if (diffInMilliseconds < 0) {
            holdingYearsDisplay.value = '양도일이 취득일보다 빠릅니다.'; // 날짜 역전 오류 메시지
            return;
        }

        const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365); // 연 단위 계산
        holdingYearsDisplay.value = diffInYears.toFixed(2) + '년'; // 소수점 2자리 표시
    };

    acquisitionDateInput.addEventListener('change', calculateHoldingYears); // 취득일 변경 시 계산
    transferDateInput.addEventListener('change', calculateHoldingYears); // 양도일 변경 시 계산

    // 필요경비 입력 버튼 토글
    toggleButton.addEventListener('click', (event) => {
        event.preventDefault(); // 버튼 기본 동작 방지
        isExpensesContainerVisible = !isExpensesContainerVisible; // 상태 토글
        expensesContainer.style.display = isExpensesContainerVisible ? 'block' : 'none'; // 상태에 따라 표시/숨김
    });

    // 필요경비 항목 체크박스 상태에 따른 입력 필드 활성화/비활성화
    document.querySelectorAll('#expensesList input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const amountField = document.getElementById(`${event.target.id}Amount`);
            if (event.target.checked) {
                amountField.disabled = false; // 선택 시 입력 활성화
            } else {
                amountField.disabled = true; // 선택 해제 시 입력 비활성화
                amountField.value = ''; // 값 초기화
            }
        });
    });

    // 필요경비 합산 계산
    const calculateExpenses = () => {
        let totalExpenses = 0;
        document.querySelectorAll('#expensesList input[type="number"]').forEach((input) => {
            totalExpenses += parseInt(input.value.replace(/,/g, '') || '0', 10); // 입력값 합산
        });
        totalExpensesDisplay.textContent = `총 필요경비: ${totalExpenses.toLocaleString()} 원`; // 총 필요경비 표시
        return totalExpenses;
    };

    // 필요경비 합산 버튼 이벤트 추가
    const calculateExpensesButton = document.getElementById('calculateExpensesButton');
    if (calculateExpensesButton) {
        calculateExpensesButton.addEventListener('click', (event) => {
            event.preventDefault(); // 버튼 기본 동작 방지
            calculateExpenses(); // 필요경비 계산
        });
    }

    // 계산 버튼 클릭 이벤트
    calculateButton.addEventListener('click', () => {
        const propertyType = propertyTypeSelect.value; // 부동산 유형
        const regulatedArea = document.getElementById('regulatedArea').value === 'yes'; // 조정대상지역 여부
        const singleHouseExemption = document.getElementById('singleHouseExemption').value === 'yes'; // 1세대 1주택 여부
        const acquisitionPrice = parseInt(document.getElementById('acquisitionPrice').value.replace(/,/g, '') || '0', 10); // 취득가액
        const transferPrice = parseInt(document.getElementById('transferPrice').value.replace(/,/g, '') || '0', 10); // 양도가액
        const expenses = calculateExpenses(); // 필요 경비 합산 계산
        const holdingYears = parseFloat(holdingYearsDisplay.value) || 0; // 보유 기간

        // 양도차익 계산
        const profit = transferPrice - acquisitionPrice - expenses; // 양도가액 - 취득가액 - 필요 경비

        // 비과세 판단 (주택만 해당)
        if (singleHouseExemption && propertyType === 'house' && transferPrice <= 1200000000) {
            document.getElementById('result').innerHTML = `<p>1세대 1주택 비과세 조건 충족으로 세금이 없습니다.</p>`;
            return;
        }

        // 기본 세율 및 중과세
        let taxRate = 0; // 기본 세율
        let surcharge = 0; // 중과세
        let longTermDeductionRate = 0; // 장기보유특별공제율 

        if (propertyType === 'house') {
            if (singleHouseExemption) {
                longTermDeductionRate = holdingYears >= 2 ? Math.min(holdingYears * 0.04, 0.8) : 0;
            } else {
                longTermDeductionRate = holdingYears >= 3 ? Math.min(holdingYears * 0.02, 0.3) : 0;
            }
            taxRate = regulatedArea ? 0.2 : 0.1;
            surcharge = regulatedArea ? 0.1 : 0;
        } else if (propertyType === 'landForest') {
            longTermDeductionRate = holdingYears >= 3 ? Math.min(holdingYears * 0.03, 0.3) : 0;
            taxRate = 0.15;
        } else if (propertyType === 'commercial') {
            longTermDeductionRate = holdingYears >= 3 ? Math.min(holdingYears * 0.03, 0.3) : 0;
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
            <p>보유 기간: ${holdingYears.toFixed(2)} 년</p>
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



  
});

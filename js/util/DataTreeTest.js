function testDataTree() {
    console.log("🔍 DataTree 정밀 테스트 시작");

    const tree = new DataTree();

    // 노드 생성
    const burger = tree.createItem("버거", 5000);
    const bun = tree.createMaterial("번", 1, 300);
    const patty = tree.createMaterial("패티", 1, 1000);
    const lettuce = tree.createMaterial("양상추", 2, 400);
    const tomato = tree.createMaterial("토마토", 1, 200);

    console.assert(burger.name === "버거", "❌ Item 생성 실패");
    console.assert(patty.cost === 1000, "❌ Material 생성 실패");

    // 중첩 구조 (소금은 토마토에)
    tree.insertChild("토마토", "소금", 1);
    tree.insertChild("버거", "번", 1);
    tree.insertChild("버거", "패티", 1);
    tree.insertChild("버거", "양상추", 2);
    tree.insertChild("버거", "토마토", 1);

    const burgerNode = tree.getNode("버거");

    // 단가 계산
    const expectedCost = bun.unitCost + patty.unitCost + (lettuce.unitCost * 2) + tomato.unitCost;
    console.assert(Math.abs(burgerNode.unitCost - expectedCost) < 0.001, "❌ 단가 계산 오류");

    // 순환 참조
    let caught = false;
    try {
        tree.insertChild("소금", "버거", 1);
    } catch (e) {
        caught = true;
    }
    console.assert(caught, "❌ 순환 참조 감지 실패");

    // 자식 제거 후 단가 재확인
    tree.removeChild("버거", "양상추");
    const expectedAfterRemove = bun.unitCost + patty.unitCost + tomato.unitCost;
    console.assert(Math.abs(burgerNode.unitCost - expectedAfterRemove) < 0.001, "❌ 제거 후 단가 계산 오류");

    // 가격 강제 설정 실패
    caught = false;
    try {
        burger.cost = 999;
    } catch (e) {
        caught = true;
    }
    console.assert(caught, "❌ 자식 있는 노드의 가격 변경 방지 실패");

    // 수량 변경 방지
    caught = false;
    try {
        burger.quantity = 2;
    } catch (e) {
        caught = true;
    }
    console.assert(caught, "❌ Item 수량 변경 방지 실패");

    // 노드 제거
    tree.removeNode("패티");
    console.assert(!burgerNode.child["패티"], "❌ 노드 제거 후 하위에서 제거 실패");

    caught = false;
    try {
        tree.getNode("패티");
    } catch (e) {
        caught = true;
    }
    console.assert(caught, "❌ 제거된 노드 접근 차단 실패");

    // JSON 직렬화/역직렬화 테스트
    const json = JSON.stringify(tree);
    const restored = DataTree.from(JSON.parse(json));
    console.assert(restored instanceof DataTree, "❌ from 복원 실패");
    console.assert(restored.getNode("버거").name === "버거", "❌ from 이후 노드 접근 실패");

    console.log("✅ 모든 테스트 통과");
}

testDataTree();
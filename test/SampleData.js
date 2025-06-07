const coffeeDataTree = new AutoSaveDataTree();

// 아이템(메뉴) 생성
coffeeDataTree.createItem("아이스 아메리카노", 4500);
coffeeDataTree.createItem("핫 아메리카노", 4000);
coffeeDataTree.createItem("카페라떼", 5000);
coffeeDataTree.createItem("카라멜 마끼아또", 5500);

// 재료 생성 (Material)
coffeeDataTree.createMaterial("에스프레소 샷", 1, 700);
coffeeDataTree.createMaterial("아이스", 100, 50);
coffeeDataTree.createMaterial("우유", 200, 400);
coffeeDataTree.createMaterial("카라멜 시럽", 30, 300);
coffeeDataTree.createMaterial("물", 200, 0);

// 아이스 아메리카노 = 에스프레소 샷 + 얼음 + 물
coffeeDataTree.insertChild("아이스 아메리카노", "에스프레소 샷", 1);
coffeeDataTree.insertChild("아이스 아메리카노", "아이스", 100);
coffeeDataTree.insertChild("아이스 아메리카노", "물", 200);

// 핫 아메리카노 = 에스프레소 샷 + 물
coffeeDataTree.insertChild("핫 아메리카노", "에스프레소 샷", 1);
coffeeDataTree.insertChild("핫 아메리카노", "물", 200);

// 카페라떼 = 에스프레소 샷 + 우유
coffeeDataTree.insertChild("카페라떼", "에스프레소 샷", 1);
coffeeDataTree.insertChild("카페라떼", "우유", 200);

// 카라멜 마끼아또 = 에스프레소 샷 + 우유 + 카라멜 시럽
coffeeDataTree.insertChild("카라멜 마끼아또", "에스프레소 샷", 1);
coffeeDataTree.insertChild("카라멜 마끼아또", "우유", 200);
coffeeDataTree.insertChild("카라멜 마끼아또", "카라멜 시럽", 30);
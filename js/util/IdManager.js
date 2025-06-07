/**
 * ID를 고유하게 관리하는 클래스
 */
class IdManager {
    constructor(startId = 1) {
        this.usedIds = new Set();      // 사용된 ID 저장
        this.lastGenerated = startId;  // 자동 생성 시작값
    }

    /**
     * 수동으로 ID 추가
     * @param {number} id
     * @returns {boolean} true: 성공, false: 중복
     */
    add(id) {
        if (typeof id !== 'number' || !Number.isInteger(id)) {
            throw new Error('ID must be an integer.');
        }
        if (this.usedIds.has(id)) return false;
        this.usedIds.add(id);
        return true;
    }

    /**
     * ID 제거
     * @param {number} id
     * @returns {boolean} true: 제거됨, false: 없었음
     */
    delete(id) {
        return this.usedIds.delete(id);
    }

    /**
     * ID 존재 여부 확인
     * @param {number} id
     * @returns {boolean}
     */
    has(id) {
        return this.usedIds.has(id);
    }

    /**
     * 고유한 ID 자동 생성
     * @returns {number}
     */
    create() {
        while (this.lastGenerated <= Number.MAX_SAFE_INTEGER) {
            const candidate = this.lastGenerated++;
            if (!this.usedIds.has(candidate)) {
                this.usedIds.add(candidate);
                return candidate;
            }
        }
        throw new Error('ID limit exceeded.');
    }

    /**
     * 모든 ID 초기화
     */
    reset() {
        this.usedIds.clear();
        this.lastGenerated = 1;
    }

    /**
     * 현재까지 등록된 모든 ID 반환
     * @returns {number[]}
     */
    getAll() {
        return Array.from(this.usedIds).sort((a, b) => a - b);
    }
}

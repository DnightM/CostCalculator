class UrlDataManager {
    static DEFAULT_PARAM_KEY = 'p'; // 기본 URL 파라미터 키
    static MAX_URL_LENGTH = 30000; // 브라우저의 안전한 URL 길이 (보수적으로 설정)

    constructor(options = {}) {
        // 사용자 정의 파라미터 키와 URL 지원
        this.paramKey = options.paramKey || UrlDataManager.DEFAULT_PARAM_KEY;
    }

    /**
     * 데이터를 URL 파라미터에 저장
     * @param {Object} obj 저장할 데이터
     * @returns {string} 압축된 데이터
     */
    saveToUrl(obj) {
        try {
            const jsonString = JSON.stringify(obj);
            const compressed = LZString.compressToEncodedURIComponent(jsonString);

            // URL 갱신
            const url = new URL(window.location.href);
            url.searchParams.set(this.paramKey, compressed);

            // URL 길이 체크
            if (url.toString().length > UrlDataManager.MAX_URL_LENGTH) {
                throw new Error(
                    `URL length exceeds the limit of ${UrlDataManager.MAX_URL_LENGTH} characters.`
                );
            }

            window.history.replaceState(null, '', url.toString());
            return compressed;
        } catch (error) {
            console.error('Failed to save data to URL:', error);
            throw error;
        }
    }

    /**
     * URL에서 데이터 복원
     * @returns {Object} 복원된 데이터
     */
    loadFromUrl() {
        try {
            const url = new URL(window.location.href);
            if (!url.searchParams.has(this.paramKey)) {
                console.warn(`No parameter found for key "${this.paramKey}".`);
                return {};
            }

            const compressed = url.searchParams.get(this.paramKey);
            if (!compressed) {
                throw new Error('No data found in the URL parameter.');
            }

            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
            if (!decompressed) {
                throw new Error('Failed to decompress data from URL.');
            }

            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Failed to load data from URL:', error);
            throw error;
        }
    }

    /**
     * URL에서 데이터 삭제
     */
    clearDataFromUrl() {
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.has(this.paramKey)) {
                url.searchParams.delete(this.paramKey);
                window.history.replaceState(null, '', url.toString());
            }
        } catch (error) {
            console.error('Failed to clear data from URL:', error);
            throw error;
        }
    }

    /**
     * 정적 메서드: 데이터를 압축
     * @param {Object} obj JSON 객체
     * @returns {string} 압축된 문자열
     */
    static compress(obj) {
        try {
            if (obj == null || typeof obj !== 'object') {
                throw new Error('compress() expects a non-null object.');
            }
            const jsonString = JSON.stringify(obj);
            return LZString.compressToEncodedURIComponent(jsonString);
        } catch (error) {
            console.error('Failed to compress data:', error);
            throw error;
        }
    }

    /**
     * 정적 메서드: 데이터를 해제
     * @param {string} compressed 압축된 문자열
     * @returns {Object} 복원된 JSON 객체
     */
    static decompress(compressed) {
        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
            if (!decompressed) {
                throw new Error('Failed to decompress data.');
            }
            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Failed to decompress data:', error);
            throw error;
        }
    }
}

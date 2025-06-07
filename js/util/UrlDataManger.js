if (typeof LZString === 'undefined') {
    throw new Error('LZString library is required but not loaded.');
}

class UrlDataManager {
    static DEFAULT_PARAM_KEY = 'p'; // 기본 URL 파라미터 키
    static MAX_URL_LENGTH = 30000; // 브라우저의 안전한 URL 길이 (보수적으로 설정)

    constructor(options = {}) {
        this.paramKey = options.paramKey || UrlDataManager.DEFAULT_PARAM_KEY;
    }

    /**
     * 데이터를 URL 파라미터에 저장 (압축 또는 원본 중 더 짧은 것 선택)
     * @param {Object} obj 저장할 데이터
     * @returns {string} 최종 저장된 문자열
     */
    saveToUrl(obj) {
        try {
            const jsonString = JSON.stringify(obj);
            const compressed = LZString.compressToEncodedURIComponent(jsonString);

            let value, isCompressed;
            if (compressed.length < jsonString.length) {
                value = compressed;
                isCompressed = '1';
            } else {
                value = encodeURIComponent(jsonString);
                isCompressed = '0';
            }

            const url = new URL(window.location.href);
            url.searchParams.set(this.paramKey, value);
            url.searchParams.set(`${this.paramKey}_c`, isCompressed);

            if (url.toString().length > UrlDataManager.MAX_URL_LENGTH) {
                throw new Error(`URL length exceeds the limit of ${UrlDataManager.MAX_URL_LENGTH} characters.`);
            }

            window.history.replaceState(null, '', url.toString());
            return value;
        } catch (e) {
            console.error('Failed to save data to URL:', e);
            throw e;
        }
    }

    /**
     * URL에서 데이터 복원 (압축 여부 플래그 기반)
     * @returns {Object} 복원된 객체
     */
    loadFromUrl() {
        try {
            const url = new URL(window.location.href);
            if (!url.searchParams.has(this.paramKey)) return {};

            const value = url.searchParams.get(this.paramKey);
            const isCompressed = url.searchParams.get(`${this.paramKey}_c`) === '1';

            const decoded = isCompressed
                ? LZString.decompressFromEncodedURIComponent(value)
                : decodeURIComponent(value);

            if (!decoded) throw new Error('Failed to decode data from URL.');
            return JSON.parse(decoded);
        } catch (e) {
            console.error('Failed to load data from URL:', e);
            throw e;
        }
    }

    clearDataFromUrl() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete(this.paramKey);
            url.searchParams.delete(`${this.paramKey}_c`);
            window.history.replaceState(null, '', url.toString());
        } catch (e) {
            console.error('Failed to clear data from URL:', e);
            throw e;
        }
    }

    static compress(obj) {
        const jsonString = JSON.stringify(obj);
        return LZString.compressToEncodedURIComponent(jsonString);
    }

    static decompress(compressed) {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) throw new Error('Decompression failed.');
        return JSON.parse(decompressed);
    }
}

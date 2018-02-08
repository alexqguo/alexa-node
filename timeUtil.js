/*
 * Random class which I'm now realizing doesn't need to exist
 */
class TimeUtil {
    /*
     * Gets the difference between two times
     */
    static getDiffInMinutes(first, second) {
        let msDiff = second - first;
        return Math.round(((msDiff % 86400000) % 3600000) / 60000);
    }
}

module.exports = TimeUtil;

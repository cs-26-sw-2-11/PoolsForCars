import { describe, expect, test } from 'vitest'
import { calcLinearDecay } from '../../../../matching/temporal_compatibility'

describe('Calculate Clamped Linear Decay', () => {

    test('When matching arrival times for tolerance 0..30', () => {
        for (var hours = 0; hours <= 24; hours++) {

            for (var minutes = 0; minutes <= 60; minutes++) {

                for (var i = 0; i <= 30; i++) {

                    expect(calcLinearDecay(`${hours}:${minutes}`, `${hours}:${minutes}`, i)).toBe(1);
                }
            }
        }
    });

    test('When 0 < toaDiff < tolerance = 20', () => {
        expect(calcLinearDecay("09:20", "09:00", 20)).toBe(0 / 4)
        expect(calcLinearDecay("09:15", "09:00", 20)).toBe(1 / 4)
        expect(calcLinearDecay("09:10", "09:00", 20)).toBe(2 / 4)
        expect(calcLinearDecay("09:05", "09:00", 20)).toBe(3 / 4)
        expect(calcLinearDecay("09:00", "09:00", 20)).toBe(4 / 4)
    });

    describe('When toaDiff < 0', () => {
        test('tolerance = 0', () => {
            expect(calcLinearDecay("09:00", "09:10", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:20", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:30", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:40", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:50", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "10:00", 0)).toBe(0)
        });

        test('tolerance = 30', () => {
            expect(calcLinearDecay("09:00", "09:10", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:20", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:30", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:40", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:50", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "10:00", 30)).toBe(0)
        });
    });


    describe('When toaDiff >= tolerance', () => {

        test('tolerance = 0', () => {
            expect(calcLinearDecay("09:00", "09:00", 0)).toBe(1)
            expect(calcLinearDecay("09:00", "09:10", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:20", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:30", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:40", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "09:50", 0)).toBe(0)
            expect(calcLinearDecay("09:00", "10:00", 0)).toBe(0)
        });

        test('tolerance = 30', () => {
            expect(calcLinearDecay("09:00", "09:30", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:40", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:50", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "10:00", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:30", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:40", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "09:50", 30)).toBe(0)
            expect(calcLinearDecay("09:00", "10:00", 30)).toBe(0)
        });
    });
})

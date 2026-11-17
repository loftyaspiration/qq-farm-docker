import animals from '../gameConfig/ranch/MCAnimalConfig.json';

export const RANCH_AUTOMATION_DEFAULTS = {
    ranch_harvest: false,
    ranch_produce: false,
    ranch_buy: false,
    ranch_upgrade: false,
    ranch_sell: false,
    ranch_grass: false,
    ranch_grass_buy: false,
    ranch_fill_cans: false,
    ranch_feed_normal: false,
    ranch_feed_organic: false,
    ranch_clean: false,
    ranch_stroke: false,
    ranch_friend_steal: false,
    ranch_friend_clean: false,
    ranch_friend_mosquito: false,
    ranch_task: true,
    ranch_share: true,
    // [fnos-fork] 牧场巡查间隔改为秒级区间（与农场 farmMin/farmMax 同一套写法），运行时随机取值。
    ranch_check_seconds_min: 30,
    ranch_check_seconds_max: 60,
    ranch_strategy: 'level' as 'level' | 'preferred' | 'bag_priority',
    ranch_bag_fallback: 'level' as 'level' | 'preferred',
    ranch_coop_animal: 0,
    ranch_shed_animal: 0,
};

export type RanchAutomationConfig = typeof RANCH_AUTOMATION_DEFAULTS;
export const RANCH_SWITCH_KEYS = Object.keys(RANCH_AUTOMATION_DEFAULTS).filter(key => typeof RANCH_AUTOMATION_DEFAULTS[key as keyof RanchAutomationConfig] === 'boolean');
export const RANCH_ANIMAL_OPTIONS = animals.filter(animal => animal.enable_flag).map(animal => ({ value: animal.id, label: animal.name, kind: animal.husbandry_type }));

/** [fnos-fork] 读到秒级巡查区间；非法或缺省时按默认值兜底，最小值大于最大值时自动交换。 */
export function ranchCheckRangeSeconds(auto: any): { minSec: number; maxSec: number } {
    const toSec = (value: unknown, fallback: number): number => {
        const number = Number.parseInt(String(value ?? ''), 10);
        return Number.isFinite(number) ? Math.max(5, Math.min(3600, number)) : fallback;
    };
    let minSec = toSec(auto?.ranch_check_seconds_min, RANCH_AUTOMATION_DEFAULTS.ranch_check_seconds_min);
    let maxSec = toSec(auto?.ranch_check_seconds_max, RANCH_AUTOMATION_DEFAULTS.ranch_check_seconds_max);
    if (minSec > maxSec) [minSec, maxSec] = [maxSec, minSec];
    return { minSec, maxSec };
}

export function normalizeRanchSetting(key: string, value: unknown): boolean | number | string {
    if (key === 'ranch_strategy' || key === 'ranch_bag_fallback') {
        const allowed = key === 'ranch_strategy' ? ['level', 'preferred', 'bag_priority'] : ['level', 'preferred'];
        if (!allowed.includes(String(value))) throw Object.assign(new Error('请选择有效的养殖策略'), { code: 'INVALID_CONFIG' });
        return String(value);
    }
    if (key === 'ranch_coop_animal' || key === 'ranch_shed_animal') {
        const id = Number(value);
        if (id !== 0 && !RANCH_ANIMAL_OPTIONS.some(animal => animal.value === id && animal.kind === (key === 'ranch_coop_animal' ? '窝' : '棚'))) {
            throw Object.assign(new Error('所选动物不适用于当前窝或棚'), { code: 'INVALID_CONFIG' });
        }
        return id;
    }
    if (key === 'ranch_check_seconds_min' || key === 'ranch_check_seconds_max') {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 5 || number > 3600) {
            throw Object.assign(new Error('牧场巡查间隔必须是 5–3600 的整数秒'), { code: 'INVALID_CONFIG' });
        }
        return number;
    }
    if (typeof value !== 'boolean') throw Object.assign(new Error('牧场开关必须为布尔值'), { code: 'INVALID_CONFIG' });
    return value;
}

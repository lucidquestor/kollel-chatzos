import { json, serverError } from './lib/http.js';

const BROOKLYN = {
  latitude: 40.6252,
  longitude: -73.9968,
  tzid: 'America/New_York',
};

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchZmanim(dateStr) {
  const params = new URLSearchParams({
    cfg: 'json',
    latitude: String(BROOKLYN.latitude),
    longitude: String(BROOKLYN.longitude),
    tzid: BROOKLYN.tzid,
    date: dateStr,
  });
  const res = await fetch(`https://www.hebcal.com/zmanim?${params}`);
  if (!res.ok) throw new Error(`Hebcal ${res.status}`);
  return res.json();
}

function pickUpcomingNight(now) {
  return Promise.all([
    fetchZmanim(dateKey(now)),
    fetchZmanim(dateKey(new Date(now.getTime() + 86400000))),
  ]).then(function (results) {
    const candidates = results.flatMap(function (day) {
      const chatzot = day.times?.chatzotNight;
      const alos = day.times?.alotHaShachar;
      if (!chatzot || !alos) return [];
      return [{ chatzot, alos, date: day.date }];
    });

    const upcoming = candidates
      .map(function (item) {
        return {
          ...item,
          chatzotAt: new Date(item.chatzot),
          alosAt: new Date(item.alos),
        };
      })
      .filter(function (item) {
        return item.chatzotAt.getTime() > now.getTime();
      })
      .sort(function (a, b) {
        return a.chatzotAt - b.chatzotAt;
      });

    return upcoming[0] || null;
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const night = await pickUpcomingNight(now);
    if (!night) return serverError(res, 'Could not load zmanim.');

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return json(res, 200, {
      ok: true,
      location: 'Brooklyn, NY',
      date: night.date,
      chatzot: night.chatzot,
      alos: night.alos,
      chatzotMs: night.chatzotAt.getTime(),
      alosMs: night.alosAt.getTime(),
    });
  } catch (err) {
    console.error('zmanim error:', err);
    return serverError(res);
  }
}

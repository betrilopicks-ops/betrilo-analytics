import React from 'react';
import { useParams } from 'react-router-dom';
import PageStub from '../components/PageStub';

const BOARDS = {
  streaks: { title: 'Hit Streaks', blurb: 'Active hitting streaks across the league, longest first.' },
  hr: { title: 'HR Leaders', blurb: 'Season home run leaders.' },
};

export default function LeaderboardsPage() {
  const { board } = useParams();
  const cfg = BOARDS[board] || { title: 'Leaderboards', blurb: 'Hit streaks and home run leaders.' };
  return <PageStub title={cfg.title} blurb={cfg.blurb} />;
}

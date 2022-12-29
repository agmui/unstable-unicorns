import unittest
import main


class PlayerTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.card1 = main.Card("test", "test", [], "test")
        self.p1 = main.Player("p1")
        self.p2 = main.Player("p2")
        self.p3 = main.Player("p3")
        self.p4 = main.Player("p4")
        # self.game = main.Game()

    def test_player_hand(self):
        self.p1.hand_add(self.card1)
        self.assertEqual(self.card1, self.p1.hand[0])

        self.p1.hand_remove(self.card1)
        self.assertEqual([], self.p1.hand[0])

        self.p1.hand_add(self.card1)
        self.p1.play(self.card1)
        self.assertEqual(self.card1, self.p1.stable[0])

        self.p1.hand_swap(self.card1, self.p2)
        self.assertEqual(self.card1, self.p2.hand[0])
        self.assertEqual([], self.p1.hand)

        self.p2.hand_stable_swap(self.card1, self.p1)
        self.assertEqual(self.card1, self.p1.stable[0])
        self.assertEqual([], self.p2.hand)

    def test_player_stable(self):
        self.p1.stable_add(self.card1)
        self.assertEqual(self.card1, self.p1.stable[0])

        self.p1.stable_remove(self.card1)
        self.assertEqual([], self.p1.stable[0])

        self.p1.stable_add(self.card1)
        self.p1.return_to_hand(self.card1)
        self.assertEqual(self.card1, self.p1.stable[0])

        self.p1.stable_swap(self.card1, self.p2)
        self.assertEqual(self.card1, self.p2.stable[0])
        self.assertEqual([], self.p1.stable)

        self.p2.stable_hand_swap(self.card1, self.p1)
        self.assertEqual(self.card1, self.p1.stable[0])
        self.assertEqual([], self.p2.stable)


class GameTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.card1 = main.Card("test", "test", [], "test")
        self.p1 = main.Player("p1")
        self.p2 = main.Player("p2")
        self.p3 = main.Player("p3")
        self.p4 = main.Player("p4")
        self.players = [self.p1, self.p2, self.p3, self.p4]
        self.game = main.Game(self.players)

    def test_game_add_player(self):
        self.game.add_players(self.players)
        self.assertEqual(self.players, self.game.players)

    def test_game_read_json(self):
        pass

    def test_game_setup(self):
        self.game.setup()

        self.assertEqual(20, len(self.game.deck))
        self.assertEqual(20, len(self.game.nursery))
        self.assertEqual(True, self.game.turn in self.players)
        for p in self.players:
            self.assertEqual(5, len(p.hand))
            self.assertEqual(main.Card, type(p.hand[0]))
            self.assertEqual(main.Card, type(p.hand[4]))

    def test_game_shuffle(self):
        cards = []
        self.game.deck = cards
        self.assertNotEqual(cards, self.game.deck)


if __name__ == '__main__':
    unittest.main()

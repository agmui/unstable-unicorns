from unittest import TestCase
import json
import main


class TestCard(TestCase):
    def test_activate_card(self):
        self.fail()

    def test_discard(self):
        self.fail()

    def test_sacrifice(self):
        self.fail()

    def test_destroy(self):
        self.fail()

    def test_draw(self):
        self.fail()

    def test_steal(self):
        self.fail()

    def test_bring_back(self):
        self.fail()

    def test_trade(self):
        self.fail()

    def test_choose(self):
        self.fail()

    def test_ban(self):
        self.fail()


class TestPlayer(TestCase):
    def setUp(self) -> None:
        self.game = main.Game()
        self.game.read_json()
        self.card1 = self.game.deck[0]
        self.card2 = self.game.deck[1]
        self.p1 = main.Player("p1")
        self.p2 = main.Player("p2")
        self.p3 = main.Player("p3")
        self.p4 = main.Player("p4")

    def test_hand_add(self):
        self.p1.hand_add(self.card1)
        self.assertEqual(self.card1, self.p1.hand[self.card1.name])

        self.p1.hand_add(self.card2)
        self.assertEqual(self.card2, self.p1.hand[self.card2.name])

    def test_stable_add(self):
        self.p1.hand_add(self.card2)
        self.assertEqual(self.card2, self.p1.hand[self.card2.name])

        self.p1.stable_add(self.card2)
        self.assertEqual(self.card2, self.p1.stable[self.card2.name])

    def test_hand_remove(self):
        self.p1.hand_add(self.card1)
        self.assertEqual(self.card1, self.p1.hand[self.card1.name])
        self.p1.hand_remove(self.card1.name)
        self.assertEqual(0, len(self.p1.hand))

    def test_stable_remove(self):
        self.p1.stable_add(self.card1)
        self.assertEqual(self.card1, self.p1.stable[self.card1.name])
        self.p1.stable_remove(self.card1.name)
        self.assertEqual(0, len(self.p1.stable))

    def test_tap_card(self):
        self.fail()

    def test_play(self):
        self.p1.hand_add(self.card1)
        self.assertEqual(self.card1, self.p1.hand[self.card1.name])
        self.p1.play(self.card1.name)
        self.assertEqual(self.card1, self.p1.stable[self.card1.name])

    def test_return_to_hand(self):
        self.p1.stable_add(self.card1)
        self.assertEqual(self.card1, self.p1.stable[self.card1.name])
        self.p1.return_to_hand(self.card1.name)
        self.assertEqual(self.card1, self.p1.hand[self.card1.name])

    def test_hand_swap(self):
        self.p1.hand_add(self.card1)
        self.p2.hand_add(self.card2)
        self.p1.hand_swap(self.card1.name, self.p2, self.card2.name)
        self.assertEqual(self.card2, self.p1.hand[self.card2.name])
        self.assertEqual(self.card1, self.p2.hand[self.card1.name])

    def test_stable_swap(self):
        self.p1.stable_add(self.card1)
        self.p2.stable_add(self.card2)
        self.p1.stable_swap(self.card1.name, self.p2, self.card2.name)
        self.assertEqual(self.card2, self.p1.stable[self.card2.name])
        self.assertEqual(self.card1, self.p2.stable[self.card1.name])

    def test_hand_stable_swap(self):
        self.p1.hand_add(self.card1)
        self.p2.stable_add(self.card2)
        self.p1.hand_stable_swap(self.card1.name, self.p2, self.card2.name)
        self.assertEqual(self.card2, self.p1.hand[self.card2.name])
        self.assertEqual(self.card1, self.p2.stable[self.card1.name])

    def test_stable_hand_swap(self):
        self.p1.stable_add(self.card1)
        self.p2.hand_add(self.card2)
        self.p1.stable_hand_swap(self.card1.name, self.p2, self.card2.name)
        self.assertEqual(self.card2, self.p1.stable[self.card2.name])
        self.assertEqual(self.card1, self.p2.hand[self.card1.name])

    def test_run_start_of_turn(self):
        self.fail()

    def test_run_end_of_turn(self):
        self.fail()

    def test_hand_find(self):
        self.p1.hand_add(self.card1)
        self.assertEqual(self.card1, self.p1.hand_find(self.card1.name))

    def test_stable_find(self):
        self.p1.stable_add(self.card1)
        self.assertEqual(self.card1, self.p1.stable_find(self.card1.name))


class TestGame(TestCase):
    def setUp(self) -> None:
        self.p1 = main.Player("p1")
        self.p2 = main.Player("p2")
        self.p3 = main.Player("p3")
        self.p4 = main.Player("p4")
        self.game = main.Game([self.p1, self.p2, self.p3, self.p4])
        self.game.read_json()
        self.card1 = self.game.deck[0]
        self.card2 = self.game.deck[1]

    def test_read_json(self):
        f = open('data.json')
        file_data = json.load(f)
        # self.assertEqual(len(file_data), len(self.game.deck))

        # testing first card's data
        for i in range(len(file_data)):
            card = self.game.deck_find(file_data[i]['name']+'0')
            self.assertEqual(file_data[i]['name']+'0', card.name)
            self.assertEqual(file_data[i]['type'], card.card_type)

            self.assertEqual(file_data[i]['action']["start_of_turn"], card.actions[main.Action.START_OF_TURN])
            self.assertEqual(file_data[i]['action']["end_of_turn"], card.actions[main.Action.END_OF_TURN])
            self.assertEqual(file_data[i]['action']["activate"], card.actions[main.Action.ACTIVATE])
            self.assertEqual(file_data[i]['action']["enter_stable"], card.actions[main.Action.ENTER_STABLE])
            self.assertEqual(file_data[i]['action']["leave_stable"], card.actions[main.Action.LEAVE_STABLE])

            self.assertEqual(file_data[i]['text'], card.text)
            self.assertEqual(self.game, card.game)
        f.close()

    def test_add_players(self):
        self.game.players = []
        self.game.add_player(self.p1)
        self.assertEqual(self.game.players[0], self.p1)

        self.game.add_player(self.p2)
        self.assertEqual(self.game.players[1], self.p2)

    def test_remove_players(self):
        self.game.remove_players(self.p1)
        self.assertEqual(self.game.players[0], self.p2)

        self.game.remove_players(self.p2)
        self.assertEqual(self.game.players[0], self.p3)

    def test_setup(self):
        self.game.setup()
        for i in self.game.players:
            self.assertEqual(len(i.hand), 5)
            self.assertEqual(len(i.stable), 0)

    # def test_shuffle(self):
    #     self.fail()
    #
    # def test_draw_from_deck(self):
    #     self.fail()
    #
    # def test_take_from_deck(self):
    #     self.fail()
    #
    # def test_draw_from_discard(self):
    #     self.fail()
    #
    # def test_take_from_discard(self):
    #     self.fail()
    #
    # def test_run_start_of_turn(self):
    #     self.fail()
    #
    # def test_run_end_of_turn(self):
    #     self.fail()

    def test_win_condition(self):
        for i in range(7):
            card = self.game.draw_from_deck()
            self.game.players[0].stable[card.name] = card
        self.assertEqual(self.game.win_condition(), self.p1)

    def test_rotate_turn(self):
        self.assertEqual(self.game.turn, 0)
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 1)
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 2)
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 3)
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 4)
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 5)

    def test_get_turn(self):
        self.assertEqual(self.game.turn, 0)
        self.assertEqual(self.p1, self.game.get_turn())
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 1)
        self.assertEqual(self.p2, self.game.get_turn())
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 2)
        self.assertEqual(self.p3, self.game.get_turn())
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 3)
        self.assertEqual(self.p4, self.game.get_turn())
        self.game.rotate_turn()
        self.assertEqual(self.game.turn, 4)
        self.assertEqual(self.p1, self.game.get_turn())


class TestGamePlay(TestCase):
    def test_game1(self):
        self.fail()

    def test_game2(self):
        self.fail()

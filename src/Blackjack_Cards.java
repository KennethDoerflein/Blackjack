// Doerflein 2022

import javax.swing.*;
import javax.swing.text.*;
import java.awt.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.Objects;


public class Blackjack_Cards {
    private static final String version = "V2.1.4j";
    private static final URL cardBack = Objects.requireNonNull(Blackjack_Cards.class.getResource("/assets/cards/allBlackBack.png"));
    private static int player1Total = 0;
    private static int dealerTotal = 0;
    private static final JTextPane textArea = new JTextPane();
    private static final StyledDocument doc = textArea.getStyledDocument();

    static void checkDealer(ArrayList<Card> cards) {
        dealerTotal = 0;
        int dealerAces = 0;
        ArrayList<Card> cardsCopy = new ArrayList<>(cards);
        for (int i = 0; i < cardsCopy.size(); i++) {
            Card currentCard = cardsCopy.get(i);
            if (currentCard.rank().equals("ace")) {
                cardsCopy.add(currentCard);
                cardsCopy.remove(i);
                dealerAces++;
            }
        }
        for (int i = 0; i < cardsCopy.size(); i++) {
            Card currentCard = cardsCopy.get(i);
            dealerTotal += currentCard.pointValue();
            if ((currentCard.rank().equals("ace") && dealerTotal > 21) && dealerAces > 0) {
                dealerTotal -= 10;
                dealerAces--;
            }
        }
    }

    static boolean checkPlayer(ArrayList<Card> cards) {
        player1Total = 0;
        int acesUnchanged = 0;
        ArrayList<Card> cardsCopy = new ArrayList<>(cards);
        for (int i = 0; i < cardsCopy.size(); i++) {
            Card currentCard = cardsCopy.get(i);
            if (currentCard.rank().equals("ace")) {
                cardsCopy.add(currentCard);
                cardsCopy.remove(i);
                acesUnchanged++;
            }
        }
        for (int i = 0; i < cardsCopy.size(); i++) {
            Card currentCard = cardsCopy.get(i);
            player1Total += currentCard.pointValue();
            if ((currentCard.rank().equals("ace") && player1Total > 21) && acesUnchanged > 0) {
                player1Total -= 10;
                acesUnchanged--;
            }
        }
        return player1Total <= 21;
    }

    public static void main(String[] args) throws BadLocationException {
        JFrame f = new JFrame("Blackjack " + version);
        f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        DefaultCaret caret = (DefaultCaret) textArea.getCaret();
        caret.setUpdatePolicy(DefaultCaret.ALWAYS_UPDATE);

        SimpleAttributeSet center = new SimpleAttributeSet();
        StyleConstants.setAlignment(center, StyleConstants.ALIGN_CENTER);
        doc.setParagraphAttributes(0, doc.getLength(), center, false);


        f.add(new JScrollPane(textArea));
        Font font = new Font("Verdana", Font.BOLD, 17);
        textArea.setFont(font);
        textArea.setPreferredSize(new Dimension(950, 800));
        f.setLocation(85, 15);
        f.pack();
        f.setVisible(true);
        textArea.setEditable(false);


        CardDeck deck = new CardDeck();

        ArrayList<Card> dealer = new ArrayList<>();
        ArrayList<Card> player1 = new ArrayList<>();

        for (int i = 0; i < 2; i++) {
            Card currentCard = deck.getCard();
            player1.add(currentCard);
        }
        for (int i = 0; i < 2; i++) {
            Card currentCard = deck.getCard();
            dealer.add(currentCard);
        }
        final JButton hitButton = new JButton("  Hit  ");
        f.getContentPane().add(BorderLayout.EAST, hitButton);
        final JButton standButton = new JButton("Stand");
        f.getContentPane().add(BorderLayout.WEST, standButton);
        final JButton restartButton = new JButton("Play Again");
        f.getContentPane().add(BorderLayout.SOUTH, restartButton);
        restartButton.setVisible(false);
        textArea.setText("");
        StyleConstants.setForeground(center, Color.red);
        StyleConstants.setFontSize(center, 22);
        doc.insertString(doc.getLength(), "Blackjack\n-----------------------------------------------------------------\n", center);
        StyleConstants.setForeground(center, Color.black);
        StyleConstants.setFontSize(center, 17);
        StyleConstants.setFontSize(center, 20);
        doc.insertString(doc.getLength(), "Dealer's cards\n", center);
        StyleConstants.setFontSize(center, 17);
        doc.insertString(doc.getLength(), "-------------------------------------\n", center);

        textArea.insertIcon(new ImageIcon(cardBack));
        doc.insertString(doc.getLength(), " ", center);

        textArea.insertIcon(new ImageIcon(dealer.get(1).imagePath()));

        doc.insertString(doc.getLength(), " ", center);

        StyleConstants.setFontSize(center, 20);
        doc.insertString(doc.getLength(), "\nPlayer's cards\n", center);
        StyleConstants.setFontSize(center, 17);
        doc.insertString(doc.getLength(), "-------------------------------------\n", center);
        doc.insertString(doc.getLength(), " ", center);
        textArea.insertIcon(new ImageIcon(player1.get(0).imagePath()));
        doc.insertString(doc.getLength(), " ", center);
        textArea.insertIcon(new ImageIcon(player1.get(1).imagePath()));
        textArea.repaint();

        hitButton.addActionListener(e -> {
                    Card currentCard = deck.getCard();
                    try {
                        doc.insertString(doc.getLength(), " ", center);
                        textArea.insertIcon(new ImageIcon(currentCard.imagePath()));
                        doc.insertString(doc.getLength(), " ", center);
                    } catch (BadLocationException err) {
                        //err.printStackTrace();
                    }
                    player1.add(currentCard);
                    player1Total += currentCard.pointValue();

                    if (!checkPlayer(player1)) {
                        restartButton.setVisible(true);
                        standButton.setEnabled(false);
                        hitButton.setEnabled(false);

                        try {
                            doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                            StyleConstants.setForeground(center, Color.red);
                            StyleConstants.setFontSize(center, 26);
                            doc.insertString(doc.getLength(), "\n\nPlayer busted.\n\nBetter luck next time!\n", center);
                        } catch (BadLocationException err) {
                            //err.printStackTrace();
                        }
                        StyleConstants.setForeground(center, Color.black);
                        StyleConstants.setFontSize(center, 17);
                    }
                    textArea.repaint();
                }
        );

        standButton.addActionListener(e -> {
            try {
                restartButton.setVisible(true);
                standButton.setEnabled(false);
                hitButton.setEnabled(false);
                textArea.setText("");
                StyleConstants.setForeground(center, Color.red);
                StyleConstants.setFontSize(center, 22);
                doc.insertString(doc.getLength(), "Blackjack\n-----------------------------------------------------------------\n", center);
                StyleConstants.setForeground(center, Color.black);
                StyleConstants.setFontSize(center, 17);

                if (player1Total == 0) {
                    checkPlayer(player1);
                }


                checkDealer(dealer);
                while (dealerTotal <= 16) {
                    Card currentCard = deck.getCard();
                    dealer.add(currentCard);
                    checkDealer(dealer);
                }

                StyleConstants.setFontSize(center, 20);
                doc.insertString(doc.getLength(), "Dealer's cards\n", center);
                StyleConstants.setFontSize(center, 17);
                doc.insertString(doc.getLength(), "-------------------------------------\n", center);
                for (Card currentCard : dealer) {
                    doc.insertString(doc.getLength(), " ", center);
                    textArea.insertIcon(new ImageIcon(currentCard.imagePath()));
                    //doc.insertString(doc.getLength()," ", center);
                }
                StyleConstants.setFontSize(center, 20);
                doc.insertString(doc.getLength(), "\nPlayer's cards\n", center);
                StyleConstants.setFontSize(center, 17);
                doc.insertString(doc.getLength(), "-------------------------------------\n", center);
                for (Card currentCard : player1) {
                    doc.insertString(doc.getLength(), " ", center);
                    textArea.insertIcon(new ImageIcon(currentCard.imagePath()));
                    //doc.insertString(doc.getLength()," ", center);
                }
                if (player1Total > 21) {
                    doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                    doc.insertString(doc.getLength(), "\nDealer total: " + dealerTotal, center);
                    StyleConstants.setForeground(center, Color.red);
                    StyleConstants.setFontSize(center, 26);
                    doc.insertString(doc.getLength(), "\n\nPlayer busted.\n\nBetter luck next time!\n", center);
                } else if (dealerTotal > 21) {
                    doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                    doc.insertString(doc.getLength(), "\nDealer total: " + dealerTotal, center);
                    StyleConstants.setForeground(center, Color.green);
                    StyleConstants.setFontSize(center, 26);
                    doc.insertString(doc.getLength(), "\n\nDealer busted.\n\nYou win!\n", center);
                } else if (dealerTotal == 21) {
                    doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                    doc.insertString(doc.getLength(), "\nDealer total: " + dealerTotal, center);
                    StyleConstants.setForeground(center, Color.red);
                    StyleConstants.setFontSize(center, 26);
                    doc.insertString(doc.getLength(), "\n\nDealer wins.\n\nBetter luck next time!\n", center);
                } else if (player1Total > dealerTotal) {
                    doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                    doc.insertString(doc.getLength(), "\nDealer total: " + dealerTotal, center);
                    StyleConstants.setForeground(center, Color.green);
                    StyleConstants.setFontSize(center, 26);
                    doc.insertString(doc.getLength(), "\n\nYou win!\n", center);
                } else {
                    doc.insertString(doc.getLength(), "\nPlayer total: " + player1Total, center);
                    doc.insertString(doc.getLength(), "\nDealer total: " + dealerTotal, center);
                    StyleConstants.setForeground(center, Color.red);
                    StyleConstants.setFontSize(center, 26);
                    doc.insertString(doc.getLength(), "\n\nDealer wins.\n\nBetter luck next time!\n", center);
                }
                StyleConstants.setForeground(center, Color.black);
                StyleConstants.setFontSize(center, 17);

            } catch (BadLocationException err) {
                //err.printStackTrace();
            }
            textArea.repaint();
        });

        restartButton.addActionListener(e -> {
            deck.redo();
            dealer.clear();
            player1.clear();
            textArea.setText("");
            try {
                StyleConstants.setForeground(center, Color.red);
                StyleConstants.setFontSize(center, 22);
                doc.insertString(doc.getLength(), "Blackjack\n-----------------------------------------------------------------\n", center);
                StyleConstants.setForeground(center, Color.black);
                StyleConstants.setFontSize(center, 17);
                StyleConstants.setFontSize(center, 20);
                doc.insertString(doc.getLength(), "Dealer's cards\n", center);
                StyleConstants.setFontSize(center, 17);
                doc.insertString(doc.getLength(), "-------------------------------------\n", center);
                for (int i = 0; i < 2; i++) {
                    dealer.add(deck.getCard());
                }
                textArea.insertIcon(new ImageIcon(cardBack));
                doc.insertString(doc.getLength(), " ", center);
                textArea.insertIcon(new ImageIcon(dealer.get(1).imagePath()));
                doc.insertString(doc.getLength(), " ", center);
                for (int i = 0; i < 2; i++) {
                    player1.add(deck.getCard());
                }
                StyleConstants.setFontSize(center, 20);
                doc.insertString(doc.getLength(), "\nPlayer's cards\n", center);
                StyleConstants.setFontSize(center, 17);
                doc.insertString(doc.getLength(), "-------------------------------------\n", center);
                doc.insertString(doc.getLength(), " ", center);
                textArea.insertIcon(new ImageIcon(player1.get(0).imagePath()));
                doc.insertString(doc.getLength(), " ", center);
                textArea.insertIcon(new ImageIcon(player1.get(1).imagePath()));

            } catch (BadLocationException err) {
                //err.printStackTrace();
            }
            dealerTotal = 0;
            player1Total = 0;
            hitButton.setEnabled(true);
            standButton.setEnabled(true);
            restartButton.setVisible(false);
            textArea.repaint();
        });
    }
}
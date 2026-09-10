import React, { useState } from 'react';
import { X, Sparkles, Send, BookOpen, Compass, ShieldCheck, Heart } from 'lucide-react';

interface SpiritualAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  scriptures?: string[];
  actionPrompt?: string;
}

export const SpiritualAssistantModal: React.FC<SpiritualAssistantModalProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Grace and peace to you in Christ! I am your Phronesis Spiritual Wisdom Companion. How can I assist your walk today? You can ask for scripture cross-references, wisdom for a workplace or relational dilemma, or discipleship study outlines.',
      scriptures: ['Proverbs 2:6', 'James 1:5', 'Ephesians 1:17'],
      actionPrompt: 'Ask about navigating career integrity or resolving conflict.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "How do I balance high career ambitions with biblical humility?",
    "Scriptures for conquering anxiety and insomnia tonight",
    "How to approach an elder for life mentorship with honor",
    "Biblical wisdom on managing money and tithing as a graduate"
  ];

  const handleSend = (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim()) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInputQuery('');
    setIsLoading(true);

    setTimeout(() => {
      let response: Message;
      const lower = text.toLowerCase();

      if (lower.includes('career') || lower.includes('ambition') || lower.includes('work')) {
        response = {
          role: 'assistant',
          content: `In the Kingdom of God, excellence in vocation is a form of worship (Colossians 3:23). Scripture contrasts selfish ambition (which breeds disorder and envy, James 3:16) with servant ambition that seeks the glory of God and the flourishing of your neighbor.\n\nElder Thomas Bradley frequently shares: "Work with such diligence that your colleagues ask what motivates you, yet hold your promotion lightly enough that God can redirect your steps at a moment's notice."`,
          scriptures: ['Colossians 3:23-24', 'Daniel 1:8', 'Proverbs 16:3', '1 Peter 5:6'],
          actionPrompt: 'Would you like to schedule a career discernment session with Dr. Samuel or Elder Thomas?'
        };
      } else if (lower.includes('anxiety') || lower.includes('peace') || lower.includes('worry')) {
        response = {
          role: 'assistant',
          content: `Beloved, anxiety is often the soul's signal that we are carrying burdens never meant for our shoulders. Philippians 4:6-7 invites us to exchange anxious thoughts for petitions with thanksgiving.\n\nTake three slow breaths now. Cast every specific scenario causing tension directly into Jesus' hands in your encrypted Prayer Vault.`,
          scriptures: ['Philippians 4:6-7', '1 Peter 5:7', 'Isaiah 26:3', 'Matthew 6:34'],
          actionPrompt: 'Consider opening the Prayer Vault to log this request under "Peace & Guidance".'
        };
      } else if (lower.includes('money') || lower.includes('tith') || lower.includes('financ')) {
        response = {
          role: 'assistant',
          content: `Biblical stewardship begins with acknowledging God as the sole owner of all things (Psalm 24:1). Tithing is not a legalistic burden, but a joyful declaration of trust in Jehovah Jireh.\n\nDr. Samuel Osei recommends setting up a 10% firstfruits direct deposit and an automated 5% benevolence margin before allocating discretionary spending.`,
          scriptures: ['Malachi 3:10', '2 Corinthians 9:6-8', 'Proverbs 3:9-10', '1 Timothy 6:17-19'],
          actionPrompt: 'Check out the "Biblical Wealth & Kingdom Economics Handbook" in your Resource Library.'
        };
      } else {
        response = {
          role: 'assistant',
          content: `God's Word is a living fountain of phronēsis (practical godly prudence). In every situation, the Holy Spirit works alongside the counsel of mature church elders to illuminate your path (Proverbs 11:14).\n\n"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." (Proverbs 3:5-6)`,
          scriptures: ['Proverbs 3:5-6', 'Romans 12:1-2', 'James 3:17'],
          actionPrompt: 'You can discuss this directly in your next 1-on-1 Discipleship Call.'
        };
      }

      setMessages([...newMsgs, response]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl text-stone-100 shadow-2xl flex flex-col h-[640px] max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-display text-white">Phronesis Spiritual Companion</h3>
              <p className="text-xs text-stone-400">Biblically Grounded Wisdom & Scripture Counsel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-600 text-white rounded-br-none shadow-md'
                    : 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {m.scriptures && m.scriptures.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-700/60 space-y-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Recommended Scriptures
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.scriptures.map((sc, scIdx) => (
                        <span
                          key={scIdx}
                          className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-stone-900 text-amber-300 border border-amber-800/40"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              Searching Scriptures and Elder wisdom notes...
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-stone-950/40 border-t border-stone-800 flex gap-2 overflow-x-auto text-xs scrollbar-none">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="shrink-0 px-3 py-1 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-900 rounded-b-2xl flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask for biblical counsel, prayer focus, or scriptures..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

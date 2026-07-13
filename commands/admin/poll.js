const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create an interactive two-option poll.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the poll will be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The question being voted on.')
                .setMaxLength(256)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('option-one')
                .setDescription('The first voting option.')
                .setMaxLength(80)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('option-two')
                .setDescription('The second voting option.')
                .setMaxLength(80)
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('How long voting remains open, in minutes.')
                .setMinValue(1)
                .setMaxValue(1440)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const question = interaction.options.getString('question');
        const optionOne = interaction.options.getString('option-one');
        const optionTwo = interaction.options.getString('option-two');
        const duration = interaction.options.getInteger('duration');
        const pingRole = interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const votes = new Map();
        const endingTimestamp =
            Math.floor(Date.now() / 1000) + duration * 60;

        const countVotes = () => {
            let optionOneVotes = 0;
            let optionTwoVotes = 0;

            for (const vote of votes.values()) {
                if (vote === 'option-one') optionOneVotes++;
                if (vote === 'option-two') optionTwoVotes++;
            }

            return { optionOneVotes, optionTwoVotes };
        };

        const createEmbed = ended => {
            const { optionOneVotes, optionTwoVotes } = countVotes();

            let resultText = `Voting ends <t:${endingTimestamp}:R>`;

            if (ended) {
                if (optionOneVotes > optionTwoVotes) {
                    resultText = `🏆 **Winner:** ${optionOne}`;
                } else if (optionTwoVotes > optionOneVotes) {
                    resultText = `🏆 **Winner:** ${optionTwo}`;
                } else {
                    resultText = '🤝 **Result:** The poll ended in a tie.';
                }
            }

            return new EmbedBuilder()
                .setColor(ended ? 'Grey' : 'Blue')
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL:
                        interaction.guild.iconURL({ dynamic: true }) ||
                        undefined,
                })
                .setTitle(ended ? '📊 Poll Ended' : '📊 Staff Poll')
                .setDescription(`## ${question}`)
                .addFields(
                    {
                        name: `1️⃣ ${optionOne}`,
                        value: `**${optionOneVotes}** vote${
                            optionOneVotes === 1 ? '' : 's'
                        }`,
                        inline: true,
                    },
                    {
                        name: `2️⃣ ${optionTwo}`,
                        value: `**${optionTwoVotes}** vote${
                            optionTwoVotes === 1 ? '' : 's'
                        }`,
                        inline: true,
                    },
                    {
                        name: ended ? '📋 Final Result' : '⏱️ Voting Period',
                        value: resultText,
                        inline: false,
                    }
                )
                .setFooter({
                    text: `Created by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTimestamp();
        };

        const createButtons = disabled =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('option-one')
                    .setLabel(optionOne)
                    .setEmoji('1️⃣')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled),

                new ButtonBuilder()
                    .setCustomId('option-two')
                    .setLabel(optionTwo)
                    .setEmoji('2️⃣')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disabled)
            );

        try {
            const pollMessage = await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [createEmbed(false)],
                components: [createButtons(false)],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content: `✅ Poll created successfully in ${channel}.`,
                ephemeral: true,
            });

            const collector =
                pollMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: duration * 60 * 1000,
                });

            collector.on('collect', async buttonInteraction => {
                const previousVote = votes.get(buttonInteraction.user.id);
                const selectedVote = buttonInteraction.customId;

                if (previousVote === selectedVote) {
                    votes.delete(buttonInteraction.user.id);

                    await buttonInteraction.update({
                        embeds: [createEmbed(false)],
                        components: [createButtons(false)],
                    });

                    await buttonInteraction.followUp({
                        content: '🗑️ Your vote has been removed.',
                        ephemeral: true,
                    });

                    return;
                }

                votes.set(buttonInteraction.user.id, selectedVote);

                await buttonInteraction.update({
                    embeds: [createEmbed(false)],
                    components: [createButtons(false)],
                });

                await buttonInteraction.followUp({
                    content:
                        previousVote
                            ? '✅ Your vote has been changed.'
                            : '✅ Your vote has been counted.',
                    ephemeral: true,
                });
            });

            collector.on('end', async () => {
                try {
                    await pollMessage.edit({
                        embeds: [createEmbed(true)],
                        components: [createButtons(true)],
                    });
                } catch (error) {
                    console.error('Could not close poll:', error);
                }
            });
        } catch (error) {
            console.error('Poll command error:', error);

            const response = {
                content:
                    '❌ I could not create that poll. Check my channel permissions.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    },
};
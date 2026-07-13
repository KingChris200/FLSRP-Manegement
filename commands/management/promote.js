const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Announce a staff promotion.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the promotion will be announced.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('staff-member')
                .setDescription('The staff member being promoted.')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('previous-rank')
                .setDescription('The staff member’s previous rank.')
                .setMaxLength(100)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('new-rank')
                .setDescription('The staff member’s new rank.')
                .setMaxLength(100)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the promotion.')
                .setMaxLength(1000)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('banner')
                .setDescription('Optional direct image URL for a promotion banner.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const staffMember =
            interaction.options.getUser('staff-member');

        const previousRank =
            interaction.options.getString('previous-rank');

        const newRank =
            interaction.options.getString('new-rank');

        const reason =
            interaction.options.getString('reason');

        const pingRole =
            interaction.options.getRole('ping');

        const banner =
            interaction.options.getString('banner');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }

        if (banner) {
            try {
                const url = new URL(banner);

                if (
                    url.protocol !== 'https:' &&
                    url.protocol !== 'http:'
                ) {
                    throw new Error('Invalid protocol');
                }
            } catch {
                return interaction.reply({
                    content:
                        '❌ Please use a valid HTTP or HTTPS banner URL.',
                    ephemeral: true,
                });
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })
            .setTitle('👑 Staff Promotion')
            .setDescription(
                `Please congratulate ${staffMember} on their promotion!`
            )
            .addFields(
                {
                    name: '👤 Staff Member',
                    value: `${staffMember}`,
                    inline: false,
                },
                {
                    name: '📉 Previous Rank',
                    value: previousRank,
                    inline: true,
                },
                {
                    name: '📈 New Rank',
                    value: newRank,
                    inline: true,
                },
                {
                    name: '📝 Reason',
                    value: reason,
                    inline: false,
                },
                {
                    name: '🛡️ Promoted By',
                    value: `${interaction.user}`,
                    inline: false,
                }
            )
            .setFooter({
                text: 'FLSRP Management • Promotion System',
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (banner) {
            embed.setImage(banner);
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content:
                    `✅ Promotion announcement sent successfully in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Promotion command error:', error);

            const response = {
                content:
                    '❌ I could not send the promotion announcement. Check my channel permissions.',
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